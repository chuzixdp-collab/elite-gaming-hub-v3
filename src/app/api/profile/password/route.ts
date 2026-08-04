import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth';
import { changePasswordSchema, parseInput } from '@/lib/validators';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(changePasswordSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const full = await db.user.findUnique({ where: { id: user.id } });
  if (!full) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const valid = await verifyPassword(parsed.data.currentPassword, full.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ success: true });
}
