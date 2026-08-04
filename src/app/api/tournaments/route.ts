import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const tournaments = await db.tournament.findMany({
    where: { isActive: true },
    include: { rewards: { orderBy: { position: 'asc' } } },
    orderBy: { startDateTime: 'asc' },
  });
  return NextResponse.json({ tournaments });
}

export async function POST(request: Request) {
  const { requireAdmin } = await import('@/lib/auth');
  let admin;
  try {
    admin = await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { tournamentCreateSchema, parseInput } = await import('@/lib/validators');
  const parsed = parseInput(tournamentCreateSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { slugify } = await import('@/lib/constants');
  const data = parsed.data;
  const slug = slugify(data.title) + '-' + Math.random().toString(36).slice(2, 6);

  const tournament = await db.tournament.create({
    data: {
      slug,
      title: data.title,
      type: data.type,
      bannerUrl: data.bannerUrl,
      description: data.description || null,
      startDateTime: new Date(data.startDateTime),
      endDateTime: data.endDateTime ? new Date(data.endDateTime) : null,
      entryFee: data.entryFee,
      prizePool: data.prizePool,
      totalSlots: data.totalSlots,
      status: 'REGISTRATION_OPEN',
    },
  });

  // Create default rewards (1st/2nd/3rd)
  const defaultRewards = [
    { position: 1, prizeAmount: data.prizePool * 0.5, prizeDescription: '1st Place' },
    { position: 2, prizeAmount: data.prizePool * 0.3, prizeDescription: '2nd Place' },
    { position: 3, prizeAmount: data.prizePool * 0.2, prizeDescription: '3rd Place' },
  ];
  await db.tournamentReward.createMany({
    data: defaultRewards.map((r) => ({ ...r, tournamentId: tournament.id })),
  });

  return NextResponse.json({ tournament });
}
