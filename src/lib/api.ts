// Shared API helpers
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export function ok(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function bad(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message: string = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message: string = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== 'ADMIN') return 'forbidden' as const;
  return user;
}

export function parseJsonSafe<T = unknown>(text: string | null): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function readBody<T = unknown>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

// Serialize helper: convert Prisma model with Date fields into a JSON-safe object
export function serialize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

// Coupon computation
export function computeCouponDiscount(params: {
  discountType: string;
  discountValue: number;
  amount: number;
  minAmount?: number;
  maxDiscount?: number | null;
}): number {
  const { discountType, discountValue, amount, minAmount = 0, maxDiscount = null } = params;
  if (amount < minAmount) return 0;
  let discount = 0;
  if (discountType === 'PERCENTAGE') {
    discount = (amount * discountValue) / 100;
  } else {
    discount = discountValue;
  }
  if (maxDiscount && discount > maxDiscount) discount = maxDiscount;
  if (discount > amount) discount = amount;
  if (discount < 0) discount = 0;
  return Math.round(discount * 100) / 100;
}

// Site settings helpers
export async function getSetting(key: string): Promise<string | null> {
  const s = await db.siteSetting.findUnique({ where: { key } });
  return s?.value ?? null;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.siteSetting.findMany();
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function setSetting(key: string, value: string) {
  await db.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
