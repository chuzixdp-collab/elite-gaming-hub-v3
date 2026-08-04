import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAdmin } from '@/lib/auth';
import { tournamentUpdateSchema, parseInput } from '@/lib/validators';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      rewards: { orderBy: { position: 'asc' } },
      registrations: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });
  if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  return NextResponse.json({ tournament });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(tournamentUpdateSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const data = parsed.data;
  const existing = await db.tournament.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startDateTime !== undefined) updateData.startDateTime = new Date(data.startDateTime);
  if (data.endDateTime !== undefined) updateData.endDateTime = data.endDateTime ? new Date(data.endDateTime) : null;
  if (data.entryFee !== undefined) updateData.entryFee = data.entryFee;
  if (data.prizePool !== undefined) updateData.prizePool = data.prizePool;
  if (data.totalSlots !== undefined) updateData.totalSlots = data.totalSlots;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.roomId !== undefined) updateData.roomId = data.roomId;
  if (data.roomPassword !== undefined) updateData.roomPassword = data.roomPassword;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const tournament = await db.tournament.update({ where: { id }, data: updateData });

  // If room ID/password published, notify all registered users
  if (data.roomId && existing.roomId !== data.roomId) {
    const regs = await db.tournamentRegistration.findMany({ where: { tournamentId: id } });
    await db.notification.createMany({
      data: regs.map((r) => ({
        userId: r.userId,
        type: 'ROOM_PUBLISHED',
        title: 'Room ID Published!',
        message: `Tournament "${tournament.title}" — Room ID: ${data.roomId}${data.roomPassword ? `, Password: ${data.roomPassword}` : ''}. Join now!`,
        metadata: JSON.stringify({ tournamentId: id }),
      })),
    });
  }

  return NextResponse.json({ tournament });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }
  const { id } = await params;
  await db.tournament.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
