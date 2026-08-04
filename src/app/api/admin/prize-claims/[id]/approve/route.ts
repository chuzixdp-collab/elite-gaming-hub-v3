import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { creditWallet } from '@/lib/wallet';

/**
 * POST /api/admin/prize-claims/[id]/approve
 * Body: { rewardType: 'DIAMONDS' | 'WALLET', rewardAmount: number, adminRemark?: string }
 *
 * Approves a prize claim. If rewardType=WALLET, credits the winner's wallet.
 * If rewardType=DIAMONDS, an admin will manually deliver diamonds outside the system
 * (we just mark the claim approved + record the reward amount).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { rewardType, rewardAmount, adminRemark } = body as {
    rewardType?: 'DIAMONDS' | 'WALLET';
    rewardAmount?: number;
    adminRemark?: string;
  };

  if (!rewardType || !['DIAMONDS', 'WALLET'].includes(rewardType)) {
    return NextResponse.json({ error: 'rewardType must be DIAMONDS or WALLET' }, { status: 400 });
  }
  if (typeof rewardAmount !== 'number' || rewardAmount <= 0) {
    return NextResponse.json({ error: 'rewardAmount must be a positive number' }, { status: 400 });
  }

  const claim = await db.prizeClaim.findUnique({ where: { id } });
  if (!claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
  }
  if (claim.status === 'APPROVED') {
    return NextResponse.json({ error: 'Claim already approved' }, { status: 400 });
  }

  const now = new Date();
  await db.prizeClaim.update({
    where: { id },
    data: {
      status: 'APPROVED',
      rewardType,
      rewardAmount,
      adminRemark: adminRemark || null,
      reviewedAt: now,
      approvedAt: now,
    },
  });

  // If WALLET reward, credit the winner's wallet automatically
  if (rewardType === 'WALLET') {
    await creditWallet({
      userId: claim.userId,
      amount: rewardAmount,
      reason: 'PRIZE_REWARD',
      description: `Prize reward for winning "${claim.tournamentId}" tournament`,
      referenceId: claim.id,
    });

    await db.notification.create({
      data: {
        userId: claim.userId,
        type: 'GENERAL',
        title: 'Prize Claim Approved!',
        message: `Your prize claim has been approved. Rs.${rewardAmount} has been credited to your wallet. Use it as a discount on your next purchase.`,
      },
    });
  } else {
    // DIAMONDS — admin will manually deliver
    await db.notification.create({
      data: {
        userId: claim.userId,
        type: 'GENERAL',
        title: 'Prize Claim Approved!',
        message: `Your prize claim has been approved! ${rewardAmount} diamonds will be delivered to your Free Fire UID (${claim.ffUid}) within 24 hours.`,
      },
    });
  }

  return NextResponse.json({ ok: true, rewardType, rewardAmount });
}
