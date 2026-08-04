import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { productCreateSchema, parseInput } from '@/lib/validators';
import { slugify } from '@/lib/constants';

export async function GET() {
  try {
    await requireAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }
  const products = await db.product.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ products });
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

  const parsed = parseInput(productCreateSchema, body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const data = parsed.data;
  const slug = data.slug || (slugify(data.name) + '-' + Math.random().toString(36).slice(2, 6));

  const product = await db.product.create({
    data: {
      slug,
      name: data.name,
      description: data.description || null,
      category: data.category,
      diamonds: data.diamonds || null,
      price: data.price,
      originalPrice: data.originalPrice || null,
      imageUrl: data.imageUrl,
      sortOrder: data.sortOrder,
      isActive: true,
    },
  });
  return NextResponse.json({ product });
}
