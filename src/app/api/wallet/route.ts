import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateWallet } from '@/lib/wallet';

/**
 * GET /api/wallet
 * Returns current user's wallet balance + recent transactions.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const wallet = await getOrCreateWallet(user.id);
  const transactions = await db.walletTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const totalCredits = transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);

  return NextResponse.json({
    wallet: {
      id: wallet.id,
      balance: wallet.balance,
      currency: 'PKR',
    },
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      reason: t.reason,
      amount: t.amount,
      balanceBefore: t.balanceBefore,
      balanceAfter: t.balanceAfter,
      description: t.description,
      referenceId: t.referenceId,
      createdAt: t.createdAt.toISOString(),
    })),
    summary: {
      totalCredits,
      totalDebits,
      net: totalCredits - totalDebits,
      currentBalance: wallet.balance,
    },
  });
}
