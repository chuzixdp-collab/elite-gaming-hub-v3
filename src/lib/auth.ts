// Auth & crypto helpers — JWT, password hashing, session management
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'elite-gaming-hub-dev-secret-key-min-32-chars-long';
const SESSION_COOKIE = 'egh_session';
const SESSION_MAX_AGE_DAYS = 7;

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload, remember = false): string {
  const expiresIn = remember ? `${SESSION_MAX_AGE_DAYS}d` : '1d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return { sub: decoded.sub as string, email: decoded.email as string, role: decoded.role as string };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, email: string, role: string, remember = false) {
  const token = signToken({ sub: userId, email, role }, remember);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (remember ? SESSION_MAX_AGE_DAYS : 1));

  await db.session.create({
    data: { userId, token, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Check session exists in DB and is valid
  const session = await db.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const user = await db.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    ffUid: user.ffUid,
    ffNickname: user.ffNickname,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
