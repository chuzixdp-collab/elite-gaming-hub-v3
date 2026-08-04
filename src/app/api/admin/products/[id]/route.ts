import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { productUpdateSchema, parseInput } from '@/lib/validators';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseInput(productUpdateSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const data: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.name !== undefined) data.name = d.name;
  if (d.description !== undefined) data.description = d.description;
  if (d.category !== undefined) data.category = d.category;
  if (d.diamonds !== undefined) data.diamonds = d.diamonds;
  if (d.price !== undefined) data.price = d.price;
  if (d.originalPrice !== undefined) data.originalPrice = d.originalPrice;
  if (d.imageUrl !== undefined) data.imageUrl = d.imageUrl;
  if (d.sortOrder !== undefined) data.sortOrder = d.sortOrder;
  if (d.isActive !== undefined) data.isActive = d.isActive;

  const product = await db.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;
  // Soft delete by deactivating
  await db.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
