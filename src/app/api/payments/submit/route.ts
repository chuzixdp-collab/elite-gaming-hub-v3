import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { parseInput, paymentSubmitSchema } from '@/lib/validators';
import { rateLimitApi, getClientIp } from '@/lib/rate-limit';
import { debitWallet, getWalletBalance } from '@/lib/wallet';

// Max screenshot size: 5 MB (encoded base64 ~6.7 MB)
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

interface SubmitResult {
  success: boolean;
  error?: string;
  status: number;
  data?: Record<string, unknown>;
}

async function handlePackagePayment(
  userId: string,
  packageId: string,
  transactionId: string,
  screenshotDataUri: string,
  paymentMethod: string,
  notes: string | null,
  ffUid: string | null,
  ffNickname: string | null,
  useWallet: boolean,
): Promise<SubmitResult> {
  const product = await db.product.findUnique({ where: { id: packageId } });
  if (!product || !product.isActive) {
    return { success: false, error: 'Package not available.', status: 404 };
  }
  if (!ffUid || !ffNickname) {
    return { success: false, error: 'Free Fire UID and Nickname are required.', status: 400 };
  }

  // Calculate wallet discount if user opted in
  let walletDiscount = 0;
  if (useWallet) {
    const balance = await getWalletBalance(userId);
    if (balance > 0) {
      walletDiscount = Math.min(balance, product.price);
    }
  }
  const finalAmount = Math.max(0, product.price - walletDiscount);

  // Debit wallet immediately (atomic) if discount > 0
  if (walletDiscount > 0) {
    try {
      await debitWallet({
        userId,
        amount: walletDiscount,
        reason: 'PURCHASE_DISCOUNT',
        description: `Wallet discount applied to order for "${product.name}"`,
        referenceId: packageId,
      });
    } catch (err) {
      console.error('[payments/submit] wallet debit failed:', err);
      return { success: false, error: 'Failed to apply wallet discount. Please try again.', status: 500 };
    }
  }

  // Create the order row (legacy Order table) so existing dashboards keep working
  const orderNumber = `EGH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const order = await db.order.create({
    data: {
      orderNumber,
      userId,
      productId: packageId,
      ffUid,
      ffNickname,
      status: 'PENDING',
      amount: product.price,
      discount: walletDiscount,
      finalAmount,
      paymentMethod,
      notes: notes || null,
    },
  });

  const payment = await db.payment.create({
    data: {
      userId,
      packageId,
      orderId: order.id,
      amount: finalAmount,
      transactionId,
      screenshot: screenshotDataUri,
      paymentMethod,
      status: 'PENDING',
    },
  });

  // Notify user + admin (admin = global notification flagged for admins)
  await db.notification.create({
    data: {
      userId,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Submitted',
      message: `Your payment of Rs. ${finalAmount} for "${product.name}" (TID: ${transactionId}) has been received.${
        walletDiscount > 0 ? ` Wallet discount of Rs. ${walletDiscount} applied.` : ''
      } Order ${orderNumber}. Pending admin review.`,
      metadata: JSON.stringify({ paymentId: payment.id, orderId: order.id, orderNumber }),
    },
  });

  return {
    success: true,
    status: 201,
    data: {
      payment,
      order,
      orderNumber,
      walletDiscount,
      finalAmount,
      message: 'Payment submitted. Pending admin approval.',
    },
  };
}

async function handleTournamentPayment(
  userId: string,
  tournamentId: string,
  transactionId: string,
  screenshotDataUri: string,
  paymentMethod: string,
  notes: string | null,
  ffUid: string | null,
  ffNickname: string | null,
  isSolo: boolean | undefined,
  teamName: string | null,
): Promise<SubmitResult> {
  const tournament = await db.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) {
    return { success: false, error: 'Tournament not found.', status: 404 };
  }
  if (tournament.status !== 'REGISTRATION_OPEN' && tournament.status !== 'UPCOMING') {
    return { success: false, error: 'Registration is closed for this tournament.', status: 400 };
  }
  if (tournament.registeredCount >= tournament.totalSlots) {
    return { success: false, error: 'Tournament is full.', status: 400 };
  }
  if (!ffUid || !ffNickname) {
    return { success: false, error: 'Free Fire UID and Nickname are required for tournament registration.', status: 400 };
  }

  // Check existing registration
  const existing = await db.tournamentRegistration.findUnique({
    where: { tournamentId_userId: { tournamentId, userId } },
  });
  if (existing && existing.status === 'APPROVED') {
    return { success: false, error: 'You are already registered for this tournament.', status: 409 };
  }

  const payment = await db.payment.create({
    data: {
      userId,
      tournamentId,
      amount: tournament.entryFee,
      transactionId,
      screenshot: screenshotDataUri,
      paymentMethod,
      status: 'PENDING',
    },
  });

  // Create or update registration as PENDING_APPROVAL (registeredCount NOT incremented yet —
  // we only count it once admin approves)
  const regData = {
    ffUid,
    ffNickname,
    isSolo: isSolo ?? true,
    teamName: teamName || null,
    status: 'PENDING_APPROVAL' as const,
    paymentId: payment.id,
  };

  let registration;
  if (existing) {
    registration = await db.tournamentRegistration.update({
      where: { id: existing.id },
      data: regData,
    });
  } else {
    registration = await db.tournamentRegistration.create({
      data: {
        tournamentId,
        userId,
        ...regData,
      },
    });
  }

  await db.notification.create({
    data: {
      userId,
      type: 'PAYMENT_RECEIVED',
      title: 'Tournament Payment Submitted',
      message: `Your registration payment of Rs. ${tournament.entryFee} for "${tournament.title}" (TID: ${transactionId}) has been received. Pending admin approval.`,
      metadata: JSON.stringify({ paymentId: payment.id, tournamentId, registrationId: registration.id }),
    },
  });

  return {
    success: true,
    status: 201,
    data: {
      payment,
      registration,
      message: 'Tournament registration submitted. Pending admin approval.',
    },
  };
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimitApi(ip);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Please log in to submit a payment.' }, { status: 401 });
  }

  // Multipart form data: fields + screenshot file
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data. Expected multipart/form-data.' }, { status: 400 });
  }

  const file = formData.get('screenshot');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Payment screenshot is required.' }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `Screenshot must be JPEG, PNG, or WebP (got ${file.type}).` }, { status: 400 });
  }
  if (file.size > MAX_SCREENSHOT_BYTES) {
    return NextResponse.json({ error: 'Screenshot must be smaller than 5 MB.' }, { status: 400 });
  }

  // Convert file to base64 data URI for storage (works on Netlify serverless)
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const screenshotDataUri = `data:${file.type};base64,${base64}`;

  // Collect remaining fields
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === 'screenshot') continue;
    if (typeof value === 'string') {
      raw[key] = value;
    }
  }
  // Booleans come in as string 'true' / 'false'
  if (typeof raw.isSolo === 'string') {
    raw.isSolo = raw.isSolo === 'true';
  }
  if (typeof raw.useWallet === 'string') {
    raw.useWallet = raw.useWallet === 'true';
  }

  const parsed = parseInput(paymentSubmitSchema, raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { packageId, tournamentId, transactionId, paymentMethod, notes, ffUid, ffNickname, isSolo, teamName } = parsed.data;
  const useWallet = parsed.data.useWallet === true;

  try {
    let result: SubmitResult;
    if (tournamentId) {
      result = await handleTournamentPayment(
        user.id,
        tournamentId,
        transactionId,
        screenshotDataUri,
        paymentMethod,
        notes ?? null,
        ffUid ?? null,
        ffNickname ?? null,
        isSolo,
        teamName ?? null,
      );
    } else if (packageId) {
      result = await handlePackagePayment(
        user.id,
        packageId,
        transactionId,
        screenshotDataUri,
        paymentMethod,
        notes ?? null,
        ffUid ?? null,
        ffNickname ?? null,
        useWallet,
      );
    } else {
      return NextResponse.json({ error: 'Either packageId or tournamentId is required.' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.data, { status: result.status });
  } catch (err) {
    console.error('[payments/submit] error:', err);
    return NextResponse.json({ error: 'Failed to submit payment. Please try again.' }, { status: 500 });
  }
}
