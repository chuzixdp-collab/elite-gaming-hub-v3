import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/referral/validate
 * Body: { referralCode: string }
 * Returns: { valid: boolean, referrerName?: string }
 * Used by signup form to preview the referrer name.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { referralCode } = body as { referralCode?: string };
  if (!referralCode || typeof referralCode !== 'string') {
    return NextResponse.json({ error: 'referralCode is required' }, { status: 400 });
  }

  const referrer = await db.user.findUnique({
    where: { referralCode: referralCode.toUpperCase().trim() },
    select: { id: true, name: true },
  });

  if (!referrer) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    referrerName: referrer.name || 'Elite Player',
  });
}
