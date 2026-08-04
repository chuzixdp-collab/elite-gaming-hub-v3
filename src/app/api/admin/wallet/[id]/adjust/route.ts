import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { creditWallet } from '@/lib/wallet';

/**
 * POST /api/admin/wallet/[id]/adjust
 * Body: { amount: number, reason?: string, description?: string }
 * Admin manually adjusts a user's wallet balance.
 * Positive amount = credit, negative = debit (but uses creditWallet for positive only).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params; // wallet id
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { amount, description } = body as {
    amount?: number;
    reason?: string;
    description?: string;
  };

  if (typeof amount !== 'number' || amount === 0) {
    return NextResponse.json({ error: 'amount must be a non-zero number' }, { status: 400 });
  }

  const wallet = await db.wallet.findUnique({ where: { id } });
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
  }

  if (amount > 0) {
    await creditWallet({
      userId: wallet.userId,
      amount,
      reason: 'ADMIN_ADJUST',
      description: description || 'Admin credit adjustment',
      referenceId: admin.id,
    });
  } else {
    // Negative adjustment = debit
    const absAmount = Math.abs(amount);
    if (wallet.balance < absAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. Wallet has Rs.${wallet.balance}, tried to debit Rs.${absAmount}` },
        { status: 400 }
      );
    }
    await db.wallet.update({
      where: { id },
      data: { balance: { decrement: absAmount } },
    });
    await db.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: wallet.userId,
        type: 'DEBIT',
        reason: 'ADMIN_ADJUST',
        amount: absAmount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - absAmount,
        description: description || 'Admin debit adjustment',
        referenceId: admin.id,
      },
    });
  }

  const updated = await db.wallet.findUnique({ where: { id } });
  return NextResponse.json({ ok: true, balance: updated?.balance ?? 0 });
}
