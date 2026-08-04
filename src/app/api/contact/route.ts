import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactSchema, parseInput } from '@/lib/validators';
import { rateLimitContact, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimitContact(ip);
  if (!rl.success) return NextResponse.json({ error: 'Too many messages. Try later.' }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(contactSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const msg = await db.contactMessage.create({ data: parsed.data });
  return NextResponse.json({ success: true, id: msg.id });
}
