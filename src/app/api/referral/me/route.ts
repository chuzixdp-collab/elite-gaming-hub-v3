import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/referral/me
 * Returns current user's referral code, link, and stats.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { referralCode: true, name: true, email: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const referralsMade = await db.referral.findMany({
    where: { referrerId: user.id },
    include: {
      referred: {
        select: { name: true, email: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    total: referralsMade.length,
    rewarded: referralsMade.filter((r) => r.status === 'REWARDED').length,
    pending: referralsMade.filter((r) => r.status === 'PENDING').length,
    blocked: referralsMade.filter((r) => r.status === 'BLOCKED').length,
    totalEarnings: referralsMade
      .filter((r) => r.status === 'REWARDED')
      .reduce((sum, r) => sum + r.rewardAmount, 0),
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const link = baseUrl
    ? `${baseUrl}/?ref=${dbUser.referralCode}`
    : `/?ref=${dbUser.referralCode}`;

  return NextResponse.json({
    referralCode: dbUser.referralCode,
    referralLink: link,
    stats,
    referrals: referralsMade.map((r) => ({
      id: r.id,
      status: r.status,
      rewardAmount: r.rewardAmount,
      createdAt: r.createdAt.toISOString(),
      rewardedAt: r.rewardedAt?.toISOString() || null,
      referred: r.referred
        ? {
            name: r.referred.name,
            email: r.referred.email,
            createdAt: r.referred.createdAt.toISOString(),
          }
        : null,
    })),
  });
}
