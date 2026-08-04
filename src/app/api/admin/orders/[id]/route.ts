import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { updateOrderStatusSchema, parseInput } from '@/lib/validators';

export async function PATCH(
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
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(updateOrderStatusSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const data: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === 'COMPLETED') data.completedAt = new Date();
  if (parsed.data.status === 'CANCELLED') data.cancelledAt = new Date();

  const order = await db.order.update({
    where: { id },
    data,
    include: { product: true, user: { select: { id: true, name: true, email: true } } },
  });

  if (parsed.data.status === 'COMPLETED') {
    await db.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER_COMPLETED',
        title: 'Order Completed!',
        message: `Your order ${order.orderNumber} for ${order.product.name} has been completed. Diamonds/membership delivered to UID ${order.ffUid}.`,
        metadata: JSON.stringify({ orderId: order.id }),
      },
    });
  } else if (parsed.data.status === 'CANCELLED') {
    await db.notification.create({
      data: {
        userId: order.userId,
        type: 'GENERAL',
        title: 'Order Cancelled',
        message: `Your order ${order.orderNumber} has been cancelled. Contact support if this was unexpected.`,
        metadata: JSON.stringify({ orderId: order.id }),
      },
    });
  }

  return NextResponse.json({ order });
}
