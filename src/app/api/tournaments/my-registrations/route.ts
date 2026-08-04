import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/tournaments/my-registrations — list the current user's tournament registrations
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const registrations = await db.tournamentRegistration.findMany({
    where: { userId: user.id },
    include: {
      tournament: {
        select: {
          id: true,
          title: true,
          type: true,
          startDateTime: true,
          endDateTime: true,
          status: true,
          roomId: true,
          roomPassword: true,
          prizePool: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ registrations });
}
