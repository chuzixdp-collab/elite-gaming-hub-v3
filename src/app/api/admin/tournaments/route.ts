import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { bad, ok, serialize, unauthorized } from '@/lib/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== 'ADMIN') return bad('Admin only', 403);

  const tournaments = await db.tournament.findMany({
    include: { rewards: { orderBy: { position: 'asc' } }, _count: { select: { registrations: true } } },
    orderBy: { startDateTime: 'desc' },
  });
  return ok({ tournaments: serialize(tournaments) });
}
