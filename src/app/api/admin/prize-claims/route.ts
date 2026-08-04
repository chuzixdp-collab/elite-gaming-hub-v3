import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/prize-claims
 * Admin: list all prize claims (with optional ?status=PENDING|APPROVED|REJECTED).
 */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (statusFilter) {
    where.status = statusFilter.toUpperCase();
  }

  const claims = await db.prizeClaim.findMany({
    where,
    include: {
      tournament: { select: { id: true, title: true, type: true } },
      user: { select: { id: true, name: true, email: true, ffUid: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ claims });
}
