'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useCart } from '@/store/cart';
import { GoldButton } from '@/components/shared/GoldButton';
import { CheckCircle2, Package, ArrowRight, Loader2, Clock } from 'lucide-react';
import { formatPKR } from '@/lib/constants';

export function OrderConfirmationView() {
  const navigate = useNavigation((s) => s.navigate);
  const { lastOrderId, lastOrderNumber, clear } = useCart();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lastOrderId) {
      navigate('store');
      return;
    }
    fetch(`/api/orders/${lastOrderId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.order) setOrder(d.order);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lastOrderId, navigate]);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F5C518] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-[#141414] border border-[#27272A] rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Payment Submitted!</h1>
          <p className="text-zinc-400 mb-6">Your payment has been received and is now <span className="text-amber-400 font-semibold">pending admin review</span>. You will be notified once approved.</p>

          {order && (
            <div className="bg-black/50 border border-[#27272A] rounded-xl p-6 text-left mb-6">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
                <Package className="w-4 h-4" />
                Order Details
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Order Number</span>
                  <span className="text-white font-mono font-semibold">{order.orderNumber || lastOrderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Product</span>
                  <span className="text-white">{order.product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Free Fire UID</span>
                  <span className="text-white font-mono">{order.ffUid || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Nickname</span>
                  <span className="text-white">{order.ffNickname || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Payment Method</span>
                  <span className="text-white uppercase">{order.paymentMethod || 'EasyPaisa'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status</span>
                  <span className="text-amber-400 font-semibold">PENDING REVIEW</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#27272A] mt-2">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-[#F5C518] font-bold text-lg">{formatPKR(order.finalAmount ?? 0)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-amber-300">
              <strong>What happens next?</strong> Our admin team will verify your EasyPaisa payment within 1–24 hours. Once approved, your order status will change to <span className="text-emerald-400 font-semibold">COMPLETED</span> and diamonds will be delivered to your Free Fire UID. You will receive a notification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <GoldButton onClick={() => navigate('dashboard')} className="flex-1">
              View in Dashboard <ArrowRight className="w-4 h-4" />
            </GoldButton>
            <GoldButton variant="outline-gold" onClick={() => navigate('store')} className="flex-1">
              Back to Store
            </GoldButton>
          </div>
        </div>
      </div>
    </div>
  );
}
