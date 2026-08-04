import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { parseInput, adminRejectPaymentSchema } from '@/lib/validators';

// POST /api/admin/payments/[id]/reject — reject a payment with a reason
// Body: { reason: string }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let adminUser: { id: string; email: string; role: string };
  try {
    adminUser = await requireAdmin() as typeof adminUser;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;
  const payment = await db.payment.findUnique({
    where: { id },
    include: { package: true, tournament: true },
  });
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }
  if (payment.status === 'REJECTED') {
    return NextResponse.json({ error: 'Payment already rejected.' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = parseInput(adminRejectPaymentSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const reason = `${parsed.data.reason} (Rejected by ${adminUser.email})`;

  const updated = await db.payment.update({
    where: { id },
    data: {
      status: 'REJECTED',
      adminRemark: reason,
      rejectedAt: new Date(),
    },
  });

  // If tournament registration payment → mark registration as REJECTED
  if (payment.tournamentId) {
    await db.tournamentRegistration.updateMany({
      where: { paymentId: payment.id },
      data: { status: 'REJECTED', adminRemark: reason },
    });
  }

  // If package order payment → mark order as CANCELLED
  if (payment.orderId) {
    await db.order.updateMany({
      where: { id: payment.orderId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }

  // Notify the user
  let title = 'Payment Rejected';
  let message = `Your payment of Rs. ${payment.amount} (TID: ${payment.transactionId}) was rejected. Reason: ${parsed.data.reason}`;
  if (payment.tournamentId && payment.tournament) {
    title = 'Tournament Registration Rejected';
    message = `Your registration payment for "${payment.tournament.title}" was rejected. Reason: ${parsed.data.reason}. Please re-submit with a valid payment.`;
  }

  await db.notification.create({
    data: {
      userId: payment.userId,
      type: payment.tournamentId ? 'TOURNAMENT_REG_REJECTED' : 'PAYMENT_REJECTED',
      title,
      message,
      metadata: JSON.stringify({ paymentId: payment.id, reason: parsed.data.reason }),
    },
  });

  return NextResponse.json({ payment: updated });
}
