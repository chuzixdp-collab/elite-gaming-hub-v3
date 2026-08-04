import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { notificationCreateSchema, parseInput } from '@/lib/validators';

export async function GET() {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }
  const notifications = await db.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json({ notifications });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(notificationCreateSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const data = parsed.data;
  if (data.userId) {
    const n = await db.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        isGlobal: false,
      },
    });
    return NextResponse.json({ notification: n });
  } else {
    // Global notification — broadcast to all users
    const users = await db.user.findMany({ where: { isActive: true }, select: { id: true } });
    await db.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: data.type,
        title: data.title,
        message: data.message,
        isGlobal: true,
      })),
    });
    return NextResponse.json({ success: true, sent: users.length });
  }
}
