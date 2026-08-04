import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const [totalUsers, totalOrders, totalTournaments, activeUsers] = await Promise.all([
    db.user.count(),
    db.order.count(),
    db.tournament.count(),
    db.user.count({ where: { isActive: true } }),
  ]);

  const revenueResult = await db.order.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { finalAmount: true },
  });

  // Last 7 days order count
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentOrders = await db.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, finalAmount: true, status: true },
  });

  const dayMap = new Map<string, { count: number; revenue: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { count: 0, revenue: 0 });
  }
  for (const o of recentOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const entry = dayMap.get(key);
    if (entry) {
      entry.count += 1;
      if (o.status === 'COMPLETED') entry.revenue += o.finalAmount;
    }
  }

  const dailyStats = Array.from(dayMap.entries()).map(([date, v]) => ({ date, ...v }));

  // Pending orders count
  const pendingOrders = await db.order.count({ where: { status: 'PENDING' } });

  // Total transactions
  const totalTransactions = await db.transaction.count();

  return NextResponse.json({
    stats: {
      totalUsers,
      totalOrders,
      totalTournaments,
      activeUsers,
      totalRevenue: revenueResult._sum.finalAmount || 0,
      pendingOrders,
      totalTransactions,
    },
    dailyStats,
  });
}
