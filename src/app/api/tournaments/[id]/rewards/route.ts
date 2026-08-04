import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAdmin } from '@/lib/auth';
import { rewardUpdateSchema, parseInput } from '@/lib/validators';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rewards = await db.tournamentReward.findMany({
    where: { tournamentId: id },
    orderBy: { position: 'asc' },
  });
  return NextResponse.json({ rewards });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(rewardUpdateSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await db.tournamentReward.deleteMany({ where: { tournamentId: id } });
  await db.tournamentReward.createMany({
    data: parsed.data.rewards.map((r) => ({
      tournamentId: id,
      position: r.position,
      prizeAmount: r.prizeAmount,
      prizeDescription: r.prizeDescription || null,
    })),
  });

  const rewards = await db.tournamentReward.findMany({
    where: { tournamentId: id },
    orderBy: { position: 'asc' },
  });
  return NextResponse.json({ rewards });
}
