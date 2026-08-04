import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }
  const settings = await db.siteSetting.findMany();
  const settingsObj: Record<string, string> = {};
  for (const s of settings) settingsObj[s.key] = s.value;
  return NextResponse.json({ settings: settingsObj });
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  let body: Record<string, string>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates = Object.entries(body);
  for (const [key, value] of updates) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  const settings = await db.siteSetting.findMany();
  const settingsObj: Record<string, string> = {};
  for (const s of settings) settingsObj[s.key] = s.value;
  return NextResponse.json({ settings: settingsObj });
}
