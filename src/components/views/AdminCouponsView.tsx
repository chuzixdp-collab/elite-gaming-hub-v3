'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Tag, Trash2, Loader2, Pencil } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
}

export function AdminCouponsView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    code: string;
    description: string;
    discountType: string;
    discountValue: string;
    minAmount: string;
    maxDiscount: string;
    usageLimit: string;
    expiresAt: string;
  }>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '10',
    minAmount: '0',
    maxDiscount: '0',
    usageLimit: '100',
    expiresAt: '',
  });

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) { navigate('login'); return; }
    if (user?.role === 'ADMIN') fetchCoupons();
  }, [hydrated, user, navigate]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        code: form.code.toUpperCase(),
        description: form.description || null,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minAmount: Number(form.minAmount),
        maxDiscount: Number(form.maxDiscount) > 0 ? Number(form.maxDiscount) : null,
        usageLimit: Number(form.usageLimit) > 0 ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      const res = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Coupon created');
      setOpen(false);
      setForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '10', minAmount: '0', maxDiscount: '0', usageLimit: '100', expiresAt: '' });
      fetchCoupons();
    } catch (err) {
      toast.error('Failed', { description: err instanceof Error ? err.message : 'Try again' });
    } finally { setSaving(false); }
  };

  const toggleActive = async (c: Coupon) => {
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !c.isActive }) });
    fetchCoupons();
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' });
    toast.success('Coupon deleted');
    fetchCoupons();
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2"><Tag className="w-7 h-7 text-[#F5C518]" /> Manage Coupons</h1>
          <Button onClick={() => setOpen(true)} className="bg-[#F5C518] text-black hover:bg-[#FFD700]"><Plus className="w-4 h-4" /> New Coupon</Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 bg-[#141414]" />)}</div>
        ) : coupons.length === 0 ? (
          <Card className="bg-[#141414] border-[#27272A] p-12 text-center">
            <Tag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No coupons yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <Card key={c.id} className="bg-[#141414] border-[#27272A] p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-[#F5C518] font-mono font-bold text-lg">{c.code}</code>
                      <Badge variant="outline" className={c.isActive ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {c.description && <div className="text-zinc-400 text-sm">{c.description}</div>}
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500 mt-2">
                      <span>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `Rs. ${c.discountValue} off`}</span>
                      <span>Min: Rs. {c.minAmount}</span>
                      {c.maxDiscount && <span>Max: Rs. {c.maxDiscount}</span>}
                      <span>Used: {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</span>
                      {c.expiresAt && <span>Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Switch checked={c.isActive} onCheckedChange={() => toggleActive(c)} />
                    <Button size="icon" variant="ghost" onClick={() => remove(c)} className="text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#141414] border-[#27272A] max-w-md">
          <DialogHeader><DialogTitle className="text-white">Create Coupon</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Code *</Label>
              <Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="bg-black border-[#27272A] text-white uppercase font-mono" placeholder="WELCOME10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-black border-[#27272A] text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Type</Label>
                <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                  <SelectTrigger className="bg-black border-[#27272A] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#27272A]">
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Value *</Label>
                <Input type="number" step="0.01" min={0} required value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Min Amount (Rs.)</Label>
                <Input type="number" step="0.01" min={0} value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Max Discount (Rs.)</Label>
                <Input type="number" step="0.01" min={0} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Usage Limit</Label>
                <Input type="number" min={0} value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Expires At</Label>
                <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-[#F5C518] text-black hover:bg-[#FFD700]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
