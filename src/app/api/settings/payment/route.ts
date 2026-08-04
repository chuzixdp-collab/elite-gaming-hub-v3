import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  DEFAULT_EASYPAISA_NUMBER,
  DEFAULT_EASYPAISA_ACCOUNT_NAME,
  DEFAULT_PAYMENT_INSTRUCTIONS,
} from '@/lib/constants';

// Public endpoint — returns the active EasyPaisa payment settings so the
// frontend can render the EasyPaisa number / instructions everywhere.
export async function GET() {
  const rows = await db.siteSetting.findMany({
    where: {
      key: {
        in: ['easypaisaNumber', 'easypaisaAccountName', 'paymentInstructions'],
      },
    },
  });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;

  return NextResponse.json({
    easypaisaNumber: map.easypaisaNumber || DEFAULT_EASYPAISA_NUMBER,
    easypaisaAccountName: map.easypaisaAccountName || DEFAULT_EASYPAISA_ACCOUNT_NAME,
    paymentInstructions: map.paymentInstructions || DEFAULT_PAYMENT_INSTRUCTIONS,
  });
}
