import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { parseInput, adminApprovePaymentSchema } from '@/lib/validators';
import { triggerReferralReward } from '@/lib/wallet';

// POST /api/admin/payments/[id]/approve — approve a payment
// Body: { remark?: string }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let adminUser: { id: string; email: string; role: string };
  try {
    adminUser = await requireAdmin() as typeof adminUser;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;
  const payment = await db.payment.findUnique({
    where: { id },
    include: { package: true, tournament: true, user: true },
  });
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }
  if (payment.status === 'APPROVED') {
    return NextResponse.json({ error: 'Payment already approved.' }, { status: 400 });
  }

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = parseInput(adminApprovePaymentSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const remark = parsed.data.remark || `Approved by admin (${adminUser.email})`;

  // Update payment
  const updated = await db.payment.update({
    where: { id },
    data: {
      status: 'APPROVED',
      adminRemark: remark,
      approvedAt: new Date(),
    },
  });

  // If this is a package purchase → mark Order as PAID + COMPLETED
  if (payment.orderId) {
    await db.order.updateMany({
      where: { id: payment.orderId },
      data: { status: 'COMPLETED', completedAt: new Date(), paymentId: payment.id },
    });
  }

  // If this is a tournament registration → mark registration as APPROVED and bump registeredCount
  if (payment.tournamentId) {
    await db.tournamentRegistration.updateMany({
      where: { paymentId: payment.id },
      data: { status: 'APPROVED' },
    });
    const reg = await db.tournamentRegistration.findFirst({
      where: { paymentId: payment.id },
    });
    if (reg) {
      // Only increment if registration was previously PENDING_APPROVAL (not already counted)
      await db.tournament.update({
        where: { id: payment.tournamentId },
        data: { registeredCount: { increment: 1 } },
      });
    }
  }

  // Notify the user
  let title = 'Payment Approved!';
  let message = `Your payment of Rs. ${payment.amount} (TID: ${payment.transactionId}) has been approved.`;
  if (payment.packageId && payment.package) {
    message += ` Your order for "${payment.package.name}" is now complete. Diamonds will be delivered shortly.`;
  } else if (payment.tournamentId && payment.tournament) {
    title = 'Tournament Registration Approved!';
    message = `Your payment for "${payment.tournament.title}" has been approved. You are now officially registered! Check tournament details for Room ID before the match starts.`;
  }

  await db.notification.create({
    data: {
      userId: payment.userId,
      type: payment.tournamentId ? 'TOURNAMENT_REG_APPROVED' : 'PAYMENT_APPROVED',
      title,
      message,
      metadata: JSON.stringify({ paymentId: payment.id, packageId: payment.packageId, tournamentId: payment.tournamentId }),
    },
  });

  // Trigger referral reward on user's FIRST successful transaction.
  // (Idempotent — does nothing if user has no referral or already rewarded.)
  try {
    if (payment.tournamentId) {
      const reg = await db.tournamentRegistration.findFirst({ where: { paymentId: payment.id } });
      if (reg) {
        await triggerReferralReward({
          userId: payment.userId,
          triggeredByType: 'TOURNAMENT_REG',
          triggeredById: reg.id,
        });
      }
    } else if (payment.orderId) {
      await triggerReferralReward({
        userId: payment.userId,
        triggeredByType: 'ORDER',
        triggeredById: payment.orderId,
      });
    }
  } catch (err) {
    console.error('[admin/payments/approve] referral reward failed:', err);
    // Non-fatal — payment is already approved; referral reward can be retried manually.
  }

  return NextResponse.json({ payment: updated });
}
