import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET    /api/admin/payments/[id] — fetch single payment with screenshot (admin only)
// DELETE /api/admin/payments/[id] — delete a payment
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;
  const payment = await db.payment.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true, ffUid: true, ffNickname: true } },
      package: true,
      tournament: true,
    },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }
  return NextResponse.json({ payment });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;
  const existing = await db.payment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  await db.payment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
