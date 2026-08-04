import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resetPasswordSchema, parseInput } from '@/lib/validators';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(resetPasswordSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const reset = await db.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await db.$transaction([
    db.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    db.passwordReset.update({ where: { id: reset.id }, data: { used: true } }),
  ]);

  return NextResponse.json({ success: true });
}
