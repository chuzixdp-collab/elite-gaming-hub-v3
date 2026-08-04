import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { tournamentRegisterSchema, parseInput } from '@/lib/validators';
import { rateLimitApi, getClientIp } from '@/lib/rate-limit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = rateLimitApi(ip);
  if (!rl.success) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please log in to register.' }, { status: 401 });

  const { id } = await params;
  const tournament = await db.tournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

  if (tournament.status !== 'REGISTRATION_OPEN' && tournament.status !== 'UPCOMING') {
    return NextResponse.json({ error: 'Registration is closed for this tournament.' }, { status: 400 });
  }

  if (tournament.registeredCount >= tournament.totalSlots) {
    return NextResponse.json({ error: 'Tournament is full.' }, { status: 400 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(tournamentRegisterSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const existingReg = await db.tournamentRegistration.findUnique({
    where: { tournamentId_userId: { tournamentId: id, userId: user.id } },
  });
  if (existingReg) {
    return NextResponse.json({ error: 'You are already registered for this tournament.' }, { status: 409 });
  }

  const reg = await db.tournamentRegistration.create({
    data: {
      tournamentId: id,
      userId: user.id,
      ffUid: parsed.data.ffUid,
      ffNickname: parsed.data.ffNickname,
      isSolo: parsed.data.isSolo,
      teamName: parsed.data.teamName || null,
    },
  });

  await db.tournament.update({
    where: { id },
    data: { registeredCount: { increment: 1 } },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      type: 'TOURNAMENT_REGISTERED',
      title: 'Tournament Registration Confirmed',
      message: `You have successfully registered for "${tournament.title}". Don't forget to check in before the start time.`,
      metadata: JSON.stringify({ tournamentId: id, registrationId: reg.id }),
    },
  });

  return NextResponse.json({ registration: reg });
}
