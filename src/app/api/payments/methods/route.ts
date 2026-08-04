import { NextResponse } from 'next/server';
import { listAvailablePaymentMethods } from '@/lib/payment/registry';

export async function GET() {
  return NextResponse.json({ methods: listAvailablePaymentMethods() });
}
