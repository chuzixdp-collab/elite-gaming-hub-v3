import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forgotPasswordSchema, parseInput } from '@/lib/validators';
import { rateLimitAuth, getClientIp } from '@/lib/rate-limit';
import crypto from 'crypto';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimitAuth(ip);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(forgotPasswordSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  // Always return success to avoid email enumeration
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.passwordReset.create({ data: { userId: user.id, token, expiresAt } });
    // In production: send email here. In dev: return token for visibility.
    return NextResponse.json({
      success: true,
      message: 'Reset token generated. Check your email.',
      devToken: process.env.NODE_ENV === 'development' ? token : undefined,
    });
  }

  return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
}
