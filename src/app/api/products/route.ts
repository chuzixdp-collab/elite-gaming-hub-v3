import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
  });
  return NextResponse.json({ products });
}
