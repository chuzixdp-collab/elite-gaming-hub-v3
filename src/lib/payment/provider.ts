// Payment provider abstraction — provider-agnostic, modular, swappable
// Each provider implements the PaymentProvider interface. Add new providers in registry.ts.

export interface PaymentIntent {
  providerTxnId: string;
  clientSecret?: string;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED';
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentVerification {
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  metadata?: Record<string, unknown>;
}

export interface RefundResult {
  status: 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'FAILED';
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: string;
    userId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentIntent>;
  verifyPayment(providerTxnId: string): Promise<PaymentVerification>;
  refund(providerTxnId: string, amount: number, reason?: string): Promise<RefundResult>;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  provider: string; // which provider to route to
}
