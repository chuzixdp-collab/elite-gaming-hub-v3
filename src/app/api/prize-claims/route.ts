import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/prize-claims
 * - Regular users: list their own prize claims.
 * - Admins: list ALL prize claims (with optional ?status=PENDING filter).
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (user.role !== 'ADMIN') {
    where.userId = user.id;
  }
  if (statusFilter) {
    where.status = statusFilter.toUpperCase();
  }

  const claims = await db.prizeClaim.findMany({
    where,
    include: {
      tournament: {
        select: { id: true, title: true, type: true },
      },
      user: user.role === 'ADMIN'
        ? { select: { id: true, name: true, email: true, ffUid: true } }
        : false,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ claims });
}

/**
 * POST /api/prize-claims
 * Body: { tournamentId, ffUid, ffNickname, screenshot, note? }
 * Creates a PENDING PrizeClaim.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { tournamentId, ffUid, ffNickname, screenshot, note } = body as {
    tournamentId?: string;
    ffUid?: string;
    ffNickname?: string;
    screenshot?: string;
    note?: string;
  };

  if (!tournamentId || !ffUid || !ffNickname || !screenshot) {
    return NextResponse.json(
      { error: 'tournamentId, ffUid, ffNickname, and screenshot are required' },
      { status: 400 }
    );
  }
  if (!/^\d{8,12}$/.test(ffUid)) {
    return NextResponse.json({ error: 'FF UID must be 8-12 digits' }, { status: 400 });
  }
  if (!screenshot.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Screenshot must be a data:image/... URI' }, { status: 400 });
  }
  if (screenshot.length > 5_000_000) {
    return NextResponse.json({ error: 'Screenshot too large (max 5MB)' }, { status: 400 });
  }

  // Validate tournament exists
  const tournament = await db.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  // Prevent duplicate pending claims for same tournament
  const existing = await db.prizeClaim.findFirst({
    where: { userId: user.id, tournamentId, status: 'PENDING' },
  });
  if (existing) {
    return NextResponse.json(
      { error: 'You already have a pending prize claim for this tournament.' },
      { status: 409 }
    );
  }

  const claim = await db.prizeClaim.create({
    data: {
      userId: user.id,
      tournamentId,
      ffUid,
      ffNickname,
      screenshot,
      note: note || null,
      status: 'PENDING',
    },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      type: 'GENERAL',
      title: 'Prize Claim Submitted',
      message: `Your prize claim for "${tournament.title}" has been submitted. Admin will review it within 1-24 hours.`,
    },
  });

  return NextResponse.json({ claim });
}
