// Transaction logger — records every payment-related event to the Transaction model
import { db } from '@/lib/db';

export async function logTransaction(params: {
  orderId?: string;
  userId?: string;
  provider: string;
  providerTxnId?: string;
  amount: number;
  currency?: string;
  status: string;
  type: 'PAYMENT' | 'REFUND';
  description?: string;
  metadata?: Record<string, unknown>;
  refundReason?: string;
}) {
  return db.transaction.create({
    data: {
      orderId: params.orderId || null,
      userId: params.userId || null,
      provider: params.provider,
      providerTxnId: params.providerTxnId || null,
      amount: params.amount,
      currency: params.currency || 'PKR',
      status: params.status,
      type: params.type,
      description: params.description || null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      refundReason: params.refundReason || null,
      refundedAt: params.type === 'REFUND' ? new Date() : null,
    },
  });
}
