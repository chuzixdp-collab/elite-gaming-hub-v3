import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/payments — list the current user's payments
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payments = await db.payment.findMany({
    where: { userId: user.id },
    include: {
      package: { select: { id: true, name: true, diamonds: true, imageUrl: true, bonusDiamonds: true } },
      tournament: { select: { id: true, title: true, type: true, startDateTime: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ payments });
}
