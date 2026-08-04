import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ok, serialize, unauthorized } from '@/lib/api';

// Verify email by marking the current user as emailVerified=true
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return unauthorized('Login required');
  await db.user.update({ where: { id: user.id }, data: { emailVerified: true } });
  const updated = await db.user.findUnique({ where: { id: user.id } });
  return ok({ user: serialize(updated) });
}
