// Mock payment provider — simulates a successful payment for development.
// Replace with real provider (Stripe/Razorpay/bKash) by implementing PaymentProvider interface.
import { PaymentProvider, PaymentIntent, PaymentVerification, RefundResult } from './provider';

export class MockProvider implements PaymentProvider {
  readonly name = 'mock';

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: string;
    userId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentIntent> {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 800));
    return {
      providerTxnId: `mock_${params.orderId}_${Date.now()}`,
      clientSecret: `mock_secret_${Date.now()}`,
      status: 'PENDING',
      metadata: { ...params.metadata, simulated: true },
    };
  }

  async verifyPayment(providerTxnId: string): Promise<PaymentVerification> {
    await new Promise((r) => setTimeout(r, 300));
    // Mock: all payments succeed 95% of the time
    const success = Math.random() > 0.05;
    return {
      status: success ? 'SUCCESS' : 'FAILED',
      metadata: { verifiedAt: new Date().toISOString(), providerTxnId },
    };
  }

  async refund(providerTxnId: string, amount: number, reason?: string): Promise<RefundResult> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      status: 'REFUNDED',
      metadata: { providerTxnId, amount, reason, refundedAt: new Date().toISOString() },
    };
  }
}
