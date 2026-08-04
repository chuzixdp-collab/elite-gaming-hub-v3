import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, verifyPassword } from '@/lib/auth';
import { loginSchema, parseInput } from '@/lib/validators';
import { rateLimitAuth, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimitAuth(ip);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many login attempts. Try again in a minute.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(loginSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { email, password, remember } = parsed.data;

  try {
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Your account has been disabled. Contact support.' }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    await createSession(user.id, user.email, user.role, remember);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl, ffUid: user.ffUid, ffNickname: user.ffNickname },
    });
  } catch (err) {
    console.error('[auth/login] error:', err);
    // Provide a helpful hint if it looks like the DB is unreachable.
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('database') || msg.includes('connection') || msg.includes('ECONNREFUSED') || msg.includes('does not exist') || msg.includes('relation')) {
      return NextResponse.json(
        {
          error: 'Server is unable to reach the database. Please verify DATABASE_URL and DATABASE_PROVIDER are set correctly in Netlify environment variables, then redeploy.',
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
