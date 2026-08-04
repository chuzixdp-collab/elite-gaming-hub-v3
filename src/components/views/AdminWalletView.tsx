'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Search, Loader2, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { GoldButton } from '@/components/shared/GoldButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatPKR } from '@/lib/constants';

interface WalletRow {
  id: string;
  balance: number;
  user: { id: string; name: string | null; email: string; role: string };
}

export function AdminWalletView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjusting, setAdjusting] = useState<WalletRow | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDesc, setAdjustDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) {
      navigate('login');
      return;
    }
    if (user?.role === 'ADMIN') fetchWallets();
  }, [hydrated, user, navigate]);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const url = search ? `/api/admin/wallet?search=${encodeURIComponent(search)}` : '/api/admin/wallet';
      const res = await fetch(url);
      const data = await res.json();
      setWallets(data.wallets || []);
    } catch {
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const t = setTimeout(fetchWallets, 300);
      return () => clearTimeout(t);
    }
  }, [search]);

  const openAdjust = (w: WalletRow) => {
    setAdjusting(w);
    setAdjustAmount('');
    setAdjustDesc('');
  };

  const submitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjusting) return;
    const amt = parseFloat(adjustAmount);
    if (!amt || amt === 0) {
      toast.error('Enter a non-zero amount');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/wallet/${adjusting.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, description: adjustDesc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Adjust failed');
      toast.success(`Wallet ${amt > 0 ? 'credited' : 'debited'} successfully`);
      setAdjusting(null);
      fetchWallets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Adjust failed');
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || !user) return null;

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0A] py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-extrabold text-white mb-2">Wallet Management</h1>
          <p className="text-zinc-400 mb-6 text-sm">View all user wallets and manually adjust balances (credits or debits).</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="card-gaming p-4">
              <WalletIcon className="w-6 h-6 text-[#F5C518] mb-2" />
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Wallets</div>
              <div className="text-xl font-bold text-white">{wallets.length}</div>
            </div>
            <div className="card-gaming p-4">
              <Plus className="w-6 h-6 text-green-500 mb-2" />
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Balance Held</div>
              <div className="text-xl font-bold text-white">{formatPKR(totalBalance)}</div>
            </div>
            <div className="card-gaming p-4">
              <Search className="w-6 h-6 text-zinc-400 mb-2" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black border-[#27272A] text-white"
              />
            </div>
          </div>

          <div className="card-gaming p-6">
            <h2 className="text-xl font-bold text-white mb-4">All Wallets</h2>
            {loading ? (
              <div className="text-zinc-500 text-center py-8 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading...
              </div>
            ) : !wallets.length ? (
              <div className="text-zinc-500 text-center py-12">No wallets found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#27272A] text-left text-zinc-400">
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 text-right">Balance</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets.map((w) => (
                      <tr key={w.id} className="border-b border-[#1F1F1F] hover:bg-[#1F1F1F]/50">
                        <td className="p-3 text-white">{w.user.name || '—'}</td>
                        <td className="p-3 text-zinc-400">{w.user.email}</td>
                        <td className="p-3">
                          <span className={w.user.role === 'ADMIN' ? 'text-[#F5C518]' : 'text-zinc-400'}>
                            {w.user.role}
                          </span>
                        </td>
                        <td className="p-3 text-right text-[#F5C518] font-bold">{formatPKR(w.balance)}</td>
                        <td className="p-3 text-right">
                          <GoldButton size="sm" variant="outline-gold" onClick={() => openAdjust(w)}>
                            Adjust
                          </GoldButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Adjust Wallet Dialog */}
      <Dialog open={!!adjusting} onOpenChange={(o) => !o && setAdjusting(null)}>
        <DialogContent className="bg-[#141414] border-[#27272A]">
          <DialogHeader>
            <DialogTitle className="text-white">
              Adjust Wallet — {adjusting?.user.name || adjusting?.user.email}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitAdjust} className="space-y-4">
            <div>
              <Label className="text-zinc-300">Current Balance</Label>
              <div className="text-2xl font-bold text-[#F5C518] mt-1">
                {adjusting ? formatPKR(adjusting.balance) : '—'}
              </div>
            </div>
            <div>
              <Label htmlFor="adjustAmount" className="text-zinc-300">
                Amount * <span className="text-zinc-500 text-xs">(positive = credit, negative = debit)</span>
              </Label>
              <Input
                id="adjustAmount"
                type="number"
                step="0.01"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="e.g. 100 or -50"
                required
                className="bg-black border-[#27272A] text-white"
              />
            </div>
            <div>
              <Label htmlFor="adjustDesc" className="text-zinc-300">Description (optional)</Label>
              <Textarea
                id="adjustDesc"
                value={adjustDesc}
                onChange={(e) => setAdjustDesc(e.target.value)}
                placeholder="Reason for adjustment..."
                className="bg-black border-[#27272A] text-white"
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAdjusting(null)} className="text-zinc-400">
                Cancel
              </Button>
              <GoldButton type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Adjustment'}
              </GoldButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
