import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createOrderSchema, parseInput } from '@/lib/validators';
import { generateOrderNumber } from '@/lib/constants';
import { getProvider } from '@/lib/payment/registry';
import { logTransaction } from '@/lib/payment/logger';
import { rateLimitApi, getClientIp } from '@/lib/rate-limit';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimitApi(ip);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please log in to place an order.' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(createOrderSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { productId, ffUid, ffNickname, paymentMethod, notes, couponCode } = parsed.data;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: 'Product not available.' }, { status: 404 });
  }

  let discount = 0;
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date()) && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
      if (product.price >= coupon.minAmount) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (product.price * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        } else {
          discount = coupon.discountValue;
        }
        appliedCoupon = coupon.code;
        await db.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }
  }

  const finalAmount = Math.max(0, product.price - discount);
  const orderNumber = generateOrderNumber();

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: user.id,
      productId,
      ffUid,
      ffNickname,
      status: 'PENDING',
      amount: product.price,
      discount,
      finalAmount,
      paymentMethod,
      paymentId: null,
      notes: notes || null,
      couponCode: appliedCoupon,
    },
    include: { product: true },
  });

  // Create payment intent via mock provider
  const provider = getProvider('mock');
  const intent = await provider.createPaymentIntent({
    amount: finalAmount,
    currency: 'PKR',
    orderId: order.id,
    userId: user.id,
    description: `${product.name} for FF UID ${ffUid}`,
    metadata: { orderNumber, paymentMethod },
  });

  await db.order.update({ where: { id: order.id }, data: { paymentId: intent.providerTxnId } });

  await logTransaction({
    orderId: order.id,
    userId: user.id,
    provider: 'mock',
    providerTxnId: intent.providerTxnId,
    amount: finalAmount,
    status: 'PENDING',
    type: 'PAYMENT',
    description: `Payment for ${orderNumber}`,
    metadata: { paymentMethod },
  });

  // Simulate payment confirmation (mock provider auto-confirms)
  const verification = await provider.verifyPayment(intent.providerTxnId);
  const newStatus = verification.status === 'SUCCESS' ? 'PAID' : 'PENDING';

  await db.order.update({
    where: { id: order.id },
    data: { status: newStatus },
  });

  await logTransaction({
    orderId: order.id,
    userId: user.id,
    provider: 'mock',
    providerTxnId: intent.providerTxnId,
    amount: finalAmount,
    status: verification.status,
    type: 'PAYMENT',
    description: `Verification for ${orderNumber}`,
  });

  if (newStatus === 'PAID') {
    await db.notification.create({
      data: {
        userId: user.id,
        type: 'ORDER_CONFIRMED',
        title: 'Order Confirmed',
        message: `Your order ${orderNumber} for ${product.name} has been confirmed. Status: Paid. Diamonds will be delivered shortly.`,
        metadata: JSON.stringify({ orderId: order.id, orderNumber }),
      },
    });
  }

  const finalOrder = await db.order.findUnique({
    where: { id: order.id },
    include: { product: true },
  });

  return NextResponse.json({ order: finalOrder });
}
