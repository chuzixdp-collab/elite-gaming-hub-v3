// CSRF protection — double-submit cookie pattern
import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_COOKIE = 'egh_csrf';
const CSRF_SECRET = process.env.CSRF_SECRET || 'elite-gaming-hub-csrf-secret-2026';

export async function generateCsrfToken(): Promise<{ token: string; cookie: string }> {
  const token = crypto.randomBytes(32).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false, // must be readable by client JS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  return { token, cookie: CSRF_COOKIE };
}

export async function validateCsrfToken(tokenFromHeader?: string | null): Promise<boolean> {
  if (!tokenFromHeader) return false;
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get(CSRF_COOKIE)?.value;
  if (!tokenFromCookie) return false;
  // Constant-time compare
  try {
    const a = Buffer.from(tokenFromHeader, 'hex');
    const b = Buffer.from(tokenFromCookie, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const CSRF_HEADER = 'x-csrf-token';
