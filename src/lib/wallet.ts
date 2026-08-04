import { db } from '@/lib/db';

/**
 * Wallet helpers — all PKR amounts.
 * Wallet balance can ONLY be used as discount at checkout for:
 *   - Diamond purchases
 *   - Membership purchases
 *   - Tournament entry fees
 */

export interface WalletInfo {
  balance: number;
  walletId: string;
}

export async function getOrCreateWallet(userId: string) {
  const existing = await db.wallet.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.wallet.create({ data: { userId, balance: 0 } });
}

export async function getWalletBalance(userId: string): Promise<number> {
  const w = await getOrCreateWallet(userId);
  return w.balance;
}

/**
 * Credit wallet (add funds) — used for referral rewards, prize rewards, refunds, admin adjustments.
 * Records a CREDIT WalletTransaction with before/after balances.
 */
export async function creditWallet(params: {
  userId: string;
  amount: number;
  reason: string; // REFERRAL_REWARD | PRIZE_REWARD | ADMIN_ADJUST | REFUND
  description?: string;
  referenceId?: string; // referralId | prizeClaimId | orderId
}): Promise<{ balanceAfter: number }> {
  const { userId, amount, reason, description, referenceId } = params;
  if (amount <= 0) throw new Error('creditWallet: amount must be > 0');

  // Atomic increment + fetch
  const wallet = await db.wallet.upsert({
    where: { userId },
    update: { balance: { increment: amount } },
    create: { userId, balance: amount },
  });

  await db.walletTransaction.create({
    data: {
      walletId: wallet.id,
      userId,
      type: 'CREDIT',
      reason,
      amount,
      balanceBefore: wallet.balance - amount,
      balanceAfter: wallet.balance,
      description,
      referenceId,
    },
  });

  return { balanceAfter: wallet.balance };
}

/**
 * Debit wallet (subtract funds) — used for purchase discounts at checkout.
 * Records a DEBIT WalletTransaction with before/after balances.
 * Throws if insufficient balance.
 */
export async function debitWallet(params: {
  userId: string;
  amount: number;
  reason: string; // PURCHASE_DISCOUNT
  description?: string;
  referenceId?: string; // orderId | tournamentRegId
}): Promise<{ balanceAfter: number }> {
  const { userId, amount, reason, description, referenceId } = params;
  if (amount <= 0) throw new Error('debitWallet: amount must be > 0');

  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < amount) {
    throw new Error(`Insufficient wallet balance. Available: Rs.${wallet.balance}, required: Rs.${amount}`);
  }

  const updated = await db.wallet.update({
    where: { userId },
    data: { balance: { decrement: amount } },
  });

  await db.walletTransaction.create({
    data: {
      walletId: updated.id,
      userId,
      type: 'DEBIT',
      reason,
      amount,
      balanceBefore: updated.balance + amount,
      balanceAfter: updated.balance,
      description,
      referenceId,
    },
  });

  return { balanceAfter: updated.balance };
}

// ============================================================
// Referral reward trigger
// ============================================================

/**
 * Trigger referral reward when a user completes their FIRST successful transaction
 * (paid order or approved tournament registration).
 * - Looks up the user's Referral record (status = PENDING)
 * - Credits Rs.5 to the REFERRER's wallet
 * - Marks the Referral as REWARDED
 * - Sends notification to the referrer
 * - Idempotent: if already rewarded, does nothing.
 */
export async function triggerReferralReward(params: {
  userId: string; // the referred user
  triggeredByType: 'ORDER' | 'TOURNAMENT_REG';
  triggeredById: string;
}): Promise<{ rewarded: boolean }> {
  const { userId, triggeredByType, triggeredById } = params;

  const referral = await db.referral.findUnique({
    where: { referredId: userId },
    include: { referrer: true },
  });

  if (!referral) return { rewarded: false };
  if (referral.status === 'REWARDED') return { rewarded: false };
  if (referral.status === 'BLOCKED') return { rewarded: false };

  // Mark referrer's rewardIssued flag on User
  await db.referral.update({
    where: { id: referral.id },
    data: {
      status: 'REWARDED',
      rewardedAt: new Date(),
      triggeredByType,
      triggeredById,
    },
  });

  await db.user.update({
    where: { id: referral.referrerId },
    data: { referralRewardIssued: true },
  });

  // Credit Rs.5 to referrer's wallet
  await creditWallet({
    userId: referral.referrerId,
    amount: referral.rewardAmount,
    reason: 'REFERRAL_REWARD',
    description: `Referral reward — ${referral.referrer.referralCode} referred a new user`,
    referenceId: referral.id,
  });

  // Notify referrer
  await db.notification.create({
    data: {
      userId: referral.referrerId,
      type: 'GENERAL',
      title: 'Referral Reward Earned!',
      message: `You earned Rs.${referral.rewardAmount}! Your referral ${referral.referralCode} just completed their first transaction.`,
    },
  });

  return { rewarded: true };
}
