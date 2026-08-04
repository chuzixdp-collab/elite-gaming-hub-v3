'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Search, ShoppingBag, Calendar, DollarSign, Eye } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  amount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: string | null;
  ffUid: string;
  ffNickname: string;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
  product: { id: string; name: string; imageUrl: string; category: string; diamonds?: number | null };
}

export function OrderHistoryView() {
  const navigate = useNavigation((s) => s.navigate);
  const back = useNavigation((s) => s.back);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (filter !== 'ALL' && o.status !== filter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.product.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters = ['ALL', 'PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={back} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-6">Order History</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-wrap gap-2 flex-1">
            {filters.map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                className={
                  filter === f
                    ? 'bg-[#F5C518] text-black hover:bg-[#FFD700] font-semibold'
                    : 'bg-transparent border-[#27272A] text-zinc-300 hover:text-white hover:border-[#F5C518]/50'
                }
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[#141414] border-[#27272A] text-white pl-10" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 bg-[#141414]" />)}</div>
        ) : filtered.length === 0 ? (
          <Card className="bg-[#141414] border-[#27272A] p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 mb-4">No orders found.</p>
            <Button onClick={() => navigate('store')} className="bg-[#F5C518] text-black hover:bg-[#FFD700]">Browse Store</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <Card key={o.id} className="bg-[#141414] border-[#27272A] p-4 hover:border-[#F5C518]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <img src={o.product.imageUrl} alt={o.product.name} className="w-14 h-14 rounded-lg object-contain bg-black shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-white font-semibold truncate">{o.product.name}</div>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5">{o.orderNumber}</div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(o.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Rs. {o.finalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(o)} className="text-[#F5C518] hover:bg-[#F5C518]/10">
                    <Eye className="w-4 h-4" /> <span className="hidden sm:inline">View</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-[#141414] border-[#27272A] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Order Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img src={selected.product.imageUrl} alt={selected.product.name} className="w-20 h-20 rounded-lg object-contain bg-black" />
                <div className="flex-1">
                  <div className="text-white font-bold">{selected.product.name}</div>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <div className="space-y-2 text-sm bg-black/40 p-4 rounded-lg">
                <div className="flex justify-between"><span className="text-zinc-400">Order #</span><span className="text-white font-mono">{selected.orderNumber}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Date</span><span className="text-white">{new Date(selected.createdAt).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">FF UID</span><span className="text-white font-mono">{selected.ffUid}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Nickname</span><span className="text-white">{selected.ffNickname}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Payment</span><span className="text-white uppercase">{selected.paymentMethod}</span></div>
                {selected.completedAt && (
                  <div className="flex justify-between"><span className="text-zinc-400">Completed</span><span className="text-emerald-400">{new Date(selected.completedAt).toLocaleString()}</span></div>
                )}
                {selected.notes && (
                  <div className="pt-2 border-t border-[#27272A]">
                    <div className="text-zinc-400 text-xs mb-1">Notes:</div>
                    <div className="text-white text-sm">{selected.notes}</div>
                  </div>
                )}
              </div>

              <div className="space-y-1 text-sm bg-black/40 p-4 rounded-lg">
                <div className="flex justify-between"><span className="text-zinc-400">Subtotal</span><span className="text-white">Rs. {selected.amount.toLocaleString()}</span></div>
                {selected.discount > 0 && (
                  <div className="flex justify-between"><span className="text-emerald-400">Discount</span><span className="text-emerald-400">-Rs. {selected.discount.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#27272A]"><span className="text-white font-semibold">Total</span><span className="text-[#F5C518] font-bold text-lg">Rs. {selected.finalAmount.toLocaleString()}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
