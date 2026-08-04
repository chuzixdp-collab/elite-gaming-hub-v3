import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/payments — list all payments with filters
// Query params: status=PENDING|APPROVED|REJECTED, type=PACKAGE|TOURNAMENT, search, page, pageSize
export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const type = searchParams.get('type') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);

  const where: Record<string, unknown> = {};
  if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    where.status = status;
  }
  if (type === 'PACKAGE') {
    where.packageId = { not: null };
  } else if (type === 'TOURNAMENT') {
    where.tournamentId = { not: null };
  }
  if (search) {
    where.OR = [
      { transactionId: { contains: search } },
      { user: { email: { contains: search } } },
      { user: { name: { contains: search } } },
    ];
  }

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true, ffUid: true, ffNickname: true } },
        package: { select: { id: true, name: true, diamonds: true, bonusDiamonds: true, price: true } },
        tournament: { select: { id: true, title: true, type: true, startDateTime: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.payment.count({ where }),
  ]);

  // Stats
  const stats = await db.payment.groupBy({
    by: ['status'],
    _count: true,
    _sum: { amount: true },
  });
  const statsObj: Record<string, { count: number; total: number }> = {};
  for (const s of stats) {
    statsObj[s.status] = { count: s._count, total: s._sum.amount ?? 0 };
  }

  return NextResponse.json({ payments, total, page, pageSize, stats: statsObj });
}
