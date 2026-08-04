'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import { Search, ShoppingBag, RefreshCw } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  ffUid: string;
  ffNickname: string;
  createdAt: string;
  product: { id: string; name: string };
  user: { id: string; email: string; name: string | null };
}

const ORDER_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

export function AdminOrdersView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) { navigate('login'); return; }
    if (user?.role === 'ADMIN') fetchOrders();
  }, [hydrated, user, navigate, page, search, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update order');
    }
  };

  if (!hydrated || !user) return null;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2"><ShoppingBag className="w-7 h-7 text-[#F5C518]" /> Manage Orders</h1>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Search by order #, UID, or nickname..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-[#141414] border-[#27272A] text-white pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-44 bg-[#141414] border-[#27272A] text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-[#27272A]">
              <SelectItem value="ALL">All Statuses</SelectItem>
              {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchOrders} className="bg-transparent border-[#27272A] text-zinc-300"><RefreshCw className="w-4 h-4" /></Button>
        </div>

        <Card className="bg-[#141414] border-[#27272A] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/50 border-b border-[#27272A]">
                <tr>
                  <th className="text-left p-3 text-zinc-400 font-medium">Order</th>
                  <th className="text-left p-3 text-zinc-400 font-medium hidden md:table-cell">User</th>
                  <th className="text-left p-3 text-zinc-400 font-medium hidden lg:table-cell">FF UID</th>
                  <th className="text-left p-3 text-zinc-400 font-medium">Amount</th>
                  <th className="text-left p-3 text-zinc-400 font-medium">Status</th>
                  <th className="text-right p-3 text-zinc-400 font-medium">Update</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => <tr key={i} className="border-b border-[#27272A]/50"><td colSpan={6} className="p-3"><Skeleton className="h-10 bg-[#0F0F0F]" /></td></tr>)
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No orders found.</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="border-b border-[#27272A]/50 hover:bg-white/5">
                      <td className="p-3">
                        <div className="text-white font-mono text-xs font-semibold">{o.orderNumber}</div>
                        <div className="text-zinc-400 text-xs">{o.product.name}</div>
                        <div className="text-zinc-500 text-xs">{new Date(o.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <div className="text-white text-sm">{o.user.name || 'Unnamed'}</div>
                        <div className="text-zinc-500 text-xs">{o.user.email}</div>
                      </td>
                      <td className="p-3 text-zinc-300 font-mono text-xs hidden lg:table-cell">{o.ffUid}<br/><span className="text-zinc-500">{o.ffNickname}</span></td>
                      <td className="p-3 text-white font-semibold">Rs. {o.finalAmount.toLocaleString()}</td>
                      <td className="p-3"><StatusBadge status={o.status} /></td>
                      <td className="p-3">
                        <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                          <SelectTrigger className="h-8 w-32 bg-black border-[#27272A] text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#141414] border-[#27272A]">
                            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-zinc-400">Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)} className="bg-transparent border-[#27272A] text-zinc-300">Prev</Button>
              <span className="text-sm text-zinc-400 self-center px-2">{page} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="bg-transparent border-[#27272A] text-zinc-300">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
