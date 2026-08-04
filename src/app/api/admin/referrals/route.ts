import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/referrals
 * Admin: list all referrals with referrer + referred user info.
 */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (statusFilter) {
    where.status = statusFilter.toUpperCase();
  }

  const referrals = await db.referral.findMany({
    where,
    include: {
      referrer: { select: { id: true, name: true, email: true, referralCode: true } },
      referred: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'PENDING').length,
    rewarded: referrals.filter((r) => r.status === 'REWARDED').length,
    blocked: referrals.filter((r) => r.status === 'BLOCKED').length,
    totalPaidOut: referrals
      .filter((r) => r.status === 'REWARDED')
      .reduce((sum, r) => sum + r.rewardAmount, 0),
  };

  return NextResponse.json({ referrals, stats });
}
