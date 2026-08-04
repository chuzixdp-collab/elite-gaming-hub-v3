import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, hashPassword } from '@/lib/auth';
import { signupSchema, parseInput } from '@/lib/validators';
import { rateLimitAuth, getClientIp } from '@/lib/rate-limit';

// Generate a unique 8-char referral code (base36 from email + random suffix)
function generateReferralCode(seed: string): string {
  const base = Buffer.from(seed)
    .toString('base64')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase();
  const suffix = Math.floor(Math.random() * 9000 + 1000).toString();
  return `${base}${suffix}`;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimitAuth(ip);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(signupSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { name, email, password, referralCode } = parsed.data;

  try {
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Validate referral code (if provided)
    let referrerId: string | undefined;
    if (referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode: referralCode.toUpperCase().trim() },
      });
      if (!referrer) {
        return NextResponse.json({ error: 'Invalid referral code.' }, { status: 400 });
      }
      referrerId = referrer.id;
      // Self-referral protection: referrer email must differ from signup email
      if (referrer.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ error: 'Self-referral is not allowed.' }, { status: 400 });
      }
    }

    const passwordHash = await hashPassword(password);

    // Generate a unique referral code for the new user (retry on collision)
    let newUserReferralCode = generateReferralCode(email);
    for (let i = 0; i < 5; i++) {
      const clash = await db.user.findUnique({ where: { referralCode: newUserReferralCode } });
      if (!clash) break;
      newUserReferralCode = generateReferralCode(email + i);
    }

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: 'USER',
        referralCode: newUserReferralCode,
        referredById: referrerId,
      },
    });

    // Create wallet for new user
    await db.wallet.create({ data: { userId: user.id, balance: 0 } });

    // If referred, create a PENDING Referral row (reward triggers on first successful txn)
    if (referrerId) {
      const referrer = await db.user.findUnique({ where: { id: referrerId } });
      if (referrer) {
        await db.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
            referralCode: referrer.referralCode,
            status: 'PENDING',
            rewardAmount: 5,
          },
        });
      }
    }

    await createSession(user.id, user.email, user.role, false);

    await db.notification.create({
      data: {
        userId: user.id,
        type: 'GENERAL',
        title: 'Welcome to Elite Gaming Hub!',
        message: `Hi ${name}, your account has been created successfully. Explore tournaments and top-up diamonds now! Your referral code is ${newUserReferralCode} — share it with friends to earn Rs.5 per signup+purchase.`,
      },
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('[auth/signup] error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('database') || msg.includes('connection') || msg.includes('ECONNREFUSED') || msg.includes('does not exist') || msg.includes('relation') || msg.includes('unique constraint')) {
      return NextResponse.json(
        {
          error: 'Server is unable to reach the database. Please verify DATABASE_URL and DATABASE_PROVIDER are set correctly in Netlify environment variables, then redeploy.',
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 });
  }
}
