import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { updateProfileSchema, parseInput } from '@/lib/validators';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const full = await db.user.findUnique({ where: { id: user.id } });
  if (!full) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    user: {
      id: full.id,
      email: full.email,
      name: full.name,
      avatarUrl: full.avatarUrl,
      ffUid: full.ffUid,
      ffNickname: full.ffNickname,
      role: full.role,
      createdAt: full.createdAt,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(updateProfileSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.ffUid !== undefined) data.ffUid = parsed.data.ffUid;
  if (parsed.data.ffNickname !== undefined) data.ffNickname = parsed.data.ffNickname;
  if (parsed.data.avatarUrl !== undefined) data.avatarUrl = parsed.data.avatarUrl;

  const updated = await db.user.update({ where: { id: user.id }, data });
  return NextResponse.json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatarUrl: updated.avatarUrl,
      ffUid: updated.ffUid,
      ffNickname: updated.ffNickname,
      role: updated.role,
    },
  });
}
