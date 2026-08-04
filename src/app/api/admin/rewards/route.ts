import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { rewardUpdateSchema, parseInput } from '@/lib/validators';
import { validateCsrfToken } from '@/lib/csrf';
import { bad, ok, readBody, serialize, unauthorized } from '@/lib/api';

// Get default reward template (from site settings) and existing tournament rewards
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== 'ADMIN') return bad('Admin only', 403);

  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournamentId');
  if (tournamentId) {
    const rewards = await db.tournamentReward.findMany({
      where: { tournamentId },
      orderBy: { position: 'asc' },
    });
    return ok({ rewards: serialize(rewards) });
  }
  const settings = await db.siteSetting.findMany({
    where: { key: { startsWith: 'reward.default' } },
  });
  return ok({ defaults: serialize(settings) });
}

// Upsert a reward for a tournament (or update default template via key "default")
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== 'ADMIN') return bad('Admin only', 403);

  const csrfHeader = request.headers.get('x-csrf-token');
  const csrfOk = await validateCsrfToken(csrfHeader);
  if (!csrfOk) return unauthorized('Invalid CSRF token');

  const body = await readBody(request);
  const { tournamentId, rewards } = (body ?? {}) as { tournamentId?: string; rewards?: Array<{ position: number; prizeAmount: number; prizeDescription?: string | null }> };

  if (!tournamentId) return bad('tournamentId required');
  if (!Array.isArray(rewards) || rewards.length === 0) return bad('rewards array required');

  const parsed = parseInput(rewardUpdateSchema, { rewards });
  if (!parsed.success) return bad(parsed.error);

  // Delete existing rewards for this tournament, then recreate
  await db.tournamentReward.deleteMany({ where: { tournamentId } });
  await db.tournamentReward.createMany({
    data: parsed.data.rewards.map((r) => ({
      tournamentId,
      position: r.position,
      prizeAmount: r.prizeAmount,
      prizeDescription: r.prizeDescription ?? null,
    })),
  });

  const fresh = await db.tournamentReward.findMany({
    where: { tournamentId },
    orderBy: { position: 'asc' },
  });
  return ok({ rewards: serialize(fresh) }, 201);
}

export async function PATCH(request: Request) {
  // Update default reward template values
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== 'ADMIN') return bad('Admin only', 403);

  const csrfHeader = request.headers.get('x-csrf-token');
  const csrfOk = await validateCsrfToken(csrfHeader);
  if (!csrfOk) return unauthorized('Invalid CSRF token');

  const body = await readBody(request);
  const { position, prizeAmount } = (body ?? {}) as { position?: number; prizeAmount?: number };
  if (typeof position !== 'number' || typeof prizeAmount !== 'number') {
    return bad('position and prizeAmount required');
  }
  const key = `reward.default${position}`;
  await db.siteSetting.upsert({
    where: { key },
    update: { value: String(prizeAmount) },
    create: { key, value: String(prizeAmount) },
  });
  return ok({ success: true });
}
