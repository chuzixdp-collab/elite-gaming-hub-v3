import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/**
 * POST /api/admin/prize-claims/[id]/reject
 * Body: { adminRemark?: string }
 * Rejects a prize claim with an optional reason.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const { adminRemark } = (body || {}) as { adminRemark?: string };

  const claim = await db.prizeClaim.findUnique({ where: { id } });
  if (!claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
  }
  if (claim.status === 'APPROVED') {
    return NextResponse.json({ error: 'Cannot reject an approved claim' }, { status: 400 });
  }
  if (claim.status === 'REJECTED') {
    return NextResponse.json({ error: 'Claim already rejected' }, { status: 400 });
  }

  const now = new Date();
  await db.prizeClaim.update({
    where: { id },
    data: {
      status: 'REJECTED',
      adminRemark: adminRemark || null,
      reviewedAt: now,
      rejectedAt: now,
    },
  });

  await db.notification.create({
    data: {
      userId: claim.userId,
      type: 'GENERAL',
      title: 'Prize Claim Rejected',
      message: `Your prize claim has been rejected.${adminRemark ? ` Reason: ${adminRemark}` : ''} Please contact support if you believe this is an error.`,
    },
  });

  return NextResponse.json({ ok: true });
}
