import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { couponValidateSchema, parseInput } from '@/lib/validators';

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(couponValidateSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { code, amount } = parsed.data;
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Coupon has expired.' }, { status: 400 });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: 'Coupon usage limit reached.' }, { status: 400 });
  }
  if (amount < coupon.minAmount) {
    return NextResponse.json({ error: `Minimum amount for this coupon is Rs. ${coupon.minAmount.toLocaleString()}.` }, { status: 400 });
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (amount * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
  } else {
    discount = coupon.discountValue;
    if (discount > amount) discount = amount;
  }

  return NextResponse.json({
    valid: true,
    discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    code: coupon.code,
  });
}
