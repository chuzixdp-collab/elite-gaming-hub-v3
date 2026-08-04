import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Public reviews for landing page
export async function GET() {
  const reviews = await db.review.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  let body: { rating?: number; comment?: string; name?: string; email?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
  }
  if (!body.comment || body.comment.length < 5) {
    return NextResponse.json({ error: 'Comment too short' }, { status: 400 });
  }

  const review = await db.review.create({
    data: {
      name: body.name || user?.name || 'Anonymous',
      email: body.email || user?.email || null,
      rating: body.rating,
      comment: body.comment,
      isActive: false, // require admin approval
    },
  });
  return NextResponse.json({ review });
}
