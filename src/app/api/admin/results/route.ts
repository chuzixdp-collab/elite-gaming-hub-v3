import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// Publish tournament winners — sends notifications to winners
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  let body: { tournamentId: string; results: Array<{ userId: string; position: number; prizeAmount: number }> };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { tournamentId, results } = body;
  const tournament = await db.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

  // Update registration statuses
  for (const r of results) {
    await db.tournamentRegistration.updateMany({
      where: { tournamentId, userId: r.userId },
      data: { status: r.position === 1 ? 'WON' : 'CHECKED_IN' },
    });
    await db.notification.create({
      data: {
        userId: r.userId,
        type: 'WINNER_ANNOUNCEMENT',
        title: `Congratulations! You placed #${r.position}!`,
        message: `You won Rs. ${r.prizeAmount.toLocaleString()} in "${tournament.title}". Our team will contact you shortly to arrange the prize.`,
        metadata: JSON.stringify({ tournamentId, position: r.position, prizeAmount: r.prizeAmount }),
      },
    });
  }

  // Mark tournament completed
  await db.tournament.update({ where: { id: tournamentId }, data: { status: 'COMPLETED' } });

  // Broadcast global announcement
  const users = await db.user.findMany({ where: { isActive: true }, select: { id: true } });
  await db.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: 'WINNER_ANNOUNCEMENT',
      title: `Tournament Results: ${tournament.title}`,
      message: `Results have been published. Check the tournament page for winners!`,
      isGlobal: true,
      metadata: JSON.stringify({ tournamentId }),
    })),
  });

  return NextResponse.json({ success: true, announced: results.length });
}
