// Payment provider registry — add new providers here
// To add Stripe: import { StripeProvider } from './stripe-provider'; providers.set('stripe', new StripeProvider());
import { PaymentProvider, PaymentMethod } from './provider';
import { MockProvider } from './mock-provider';

const providers = new Map<string, PaymentProvider>();
providers.set('mock', new MockProvider());

export function getProvider(name: string = 'mock'): PaymentProvider {
  const p = providers.get(name);
  if (!p) throw new Error(`Unknown payment provider: ${name}`);
  return p;
}

export function listProviders(): string[] {
  return Array.from(providers.keys());
}

export function listAvailablePaymentMethods(): PaymentMethod[] {
  // All methods route through 'mock' provider in dev.
  // In production: each method would route to its real provider.
  return [
    { id: 'bkash', name: 'bKash', icon: '📱', description: 'Pay with bKash wallet', provider: 'mock' },
    { id: 'nagad', name: 'Nagad', icon: '💳', description: 'Pay with Nagad wallet', provider: 'mock' },
    { id: 'rocket', name: 'Rocket', icon: '🚀', description: 'Pay with Rocket wallet', provider: 'mock' },
    { id: 'card', name: 'Credit / Debit Card', icon: '💳', description: 'Visa, Mastercard, Amex', provider: 'mock' },
    { id: 'upi', name: 'UPI', icon: '🔗', description: 'Pay via UPI', provider: 'mock' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️', description: 'Pay with PayPal balance', provider: 'mock' },
  ];
}
