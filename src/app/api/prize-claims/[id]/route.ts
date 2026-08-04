import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/prize-claims/[id]
 * Returns a single prize claim (user must own it OR be admin).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const claim = await db.prizeClaim.findUnique({
    where: { id },
    include: {
      tournament: { select: { id: true, title: true, type: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!claim) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (claim.userId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ claim });
}

/**
 * DELETE /api/prize-claims/[id]
 * User can delete their own PENDING claim. Admin can delete any claim.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const claim = await db.prizeClaim.findUnique({ where: { id } });
  if (!claim) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (claim.userId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (claim.status === 'APPROVED' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Cannot delete an approved claim' }, { status: 400 });
  }

  await db.prizeClaim.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
