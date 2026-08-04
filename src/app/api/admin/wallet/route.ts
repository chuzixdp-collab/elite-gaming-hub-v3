import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/wallet
 * Admin: list all wallets with user info + recent transactions.
 */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';

  const where: Record<string, unknown> = {};
  if (search) {
    where.user = {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    };
  }

  const wallets = await db.wallet.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { balance: 'desc' },
  });

  return NextResponse.json({ wallets });
}
