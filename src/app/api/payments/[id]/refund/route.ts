import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getProvider } from '@/lib/payment/registry';
import { logTransaction } from '@/lib/payment/logger';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;
  const txn = await db.transaction.findUnique({ where: { id }, include: { order: true } });
  if (!txn) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  if (txn.type !== 'PAYMENT') return NextResponse.json({ error: 'Cannot refund non-payment transaction' }, { status: 400 });

  let body: { reason?: string } = {};
  try { body = await request.json(); } catch { /* allow empty body */ }

  const provider = getProvider(txn.provider);
  const result = await provider.refund(txn.providerTxnId || '', txn.amount, body.reason);

  await logTransaction({
    orderId: txn.orderId || undefined,
    userId: txn.userId || undefined,
    provider: txn.provider,
    providerTxnId: txn.providerTxnId || undefined,
    amount: txn.amount,
    status: result.status,
    type: 'REFUND',
    description: `Refund for transaction ${txn.id}`,
    refundReason: body.reason,
    metadata: result.metadata,
  });

  if (result.status === 'REFUNDED' && txn.orderId) {
    await db.order.update({
      where: { id: txn.orderId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }

  return NextResponse.json({ success: true, status: result.status });
}
