import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/prize-claims/[id]
 * Admin: get a single prize claim (including the screenshot).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const claim = await db.prizeClaim.findUnique({
    where: { id },
    include: {
      tournament: { select: { id: true, title: true, type: true, prizePool: true } },
      user: { select: { id: true, name: true, email: true, ffUid: true } },
    },
  });

  if (!claim) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ claim });
}

/**
 * DELETE /api/admin/prize-claims/[id]
 * Admin: delete any prize claim.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  await db.prizeClaim.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
