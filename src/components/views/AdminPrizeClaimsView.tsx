'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { motion } from 'framer-motion';
import {
  Trophy,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ImageIcon,
  AlertCircle,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { GoldButton } from '@/components/shared/GoldButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatPKR } from '@/lib/constants';

interface PrizeClaim {
  id: string;
  ffUid: string;
  ffNickname: string;
  note: string | null;
  status: string;
  rewardType: string | null;
  rewardAmount: number | null;
  adminRemark: string | null;
  createdAt: string;
  reviewedAt: string | null;
  tournament: { id: string; title: string; type: string; prizePool: number };
  user: { id: string; name: string | null; email: string; ffUid: string | null };
}

const STATUS_TABS = [
  { key: 'all',      label: 'All' },
  { key: 'PENDING',  label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PENDING:  { label: 'Pending Review',  icon: Clock,        color: '#a1a1aa' },
  APPROVED: { label: 'Approved',         icon: CheckCircle2, color: '#10b981' },
  REJECTED: { label: 'Rejected',         icon: XCircle,      color: '#ef4444' },
};

export function AdminPrizeClaimsView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [claims, setClaims] = useState<PrizeClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('all');

  // Approve dialog state
  const [approving, setApproving] = useState<PrizeClaim | null>(null);
  const [rewardType, setRewardType] = useState<'WALLET' | 'DIAMONDS'>('WALLET');
  const [rewardAmount, setRewardAmount] = useState('');
  const [approveRemark, setApproveRemark] = useState('');
  const [saving, setSaving] = useState(false);

  // Reject dialog state
  const [rejecting, setRejecting] = useState<PrizeClaim | null>(null);
  const [rejectRemark, setRejectRemark] = useState('');

  // Screenshot viewer
  const [viewing, setViewing] = useState<PrizeClaim | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) {
      navigate('login');
      return;
    }
    if (user?.role === 'ADMIN') fetchClaims();
  }, [hydrated, user, navigate, tab]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const url = tab === 'all' ? '/api/admin/prize-claims' : `/api/admin/prize-claims?status=${tab}`;
      const res = await fetch(url);
      const data = await res.json();
      setClaims(data.claims || []);
    } catch {
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const openApprove = (c: PrizeClaim) => {
    setApproving(c);
    setRewardType('WALLET');
    setRewardAmount(c.tournament.prizePool ? String(c.tournament.prizePool * 0.5) : '');
    setApproveRemark('');
  };

  const submitApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approving) return;
    const amt = parseFloat(rewardAmount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid reward amount');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/prize-claims/${approving.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardType, rewardAmount: amt, adminRemark: approveRemark }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approve failed');
      toast.success('Prize claim approved!');
      setApproving(null);
      fetchClaims();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approve failed');
    } finally {
      setSaving(false);
    }
  };

  const submitReject = async () => {
    if (!rejecting) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/prize-claims/${rejecting.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminRemark: rejectRemark }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reject failed');
      toast.success('Claim rejected');
      setRejecting(null);
      setRejectRemark('');
      fetchClaims();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reject failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteClaim = async (c: PrizeClaim) => {
    if (!confirm(`Delete this claim from ${c.user.name || c.user.email}?`)) return;
    try {
      const res = await fetch(`/api/admin/prize-claims/${c.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Claim deleted');
      fetchClaims();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0A] py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-extrabold text-white mb-2">Prize Claims Management</h1>
          <p className="text-zinc-400 mb-6 text-sm">Review winning screenshots, approve/reject claims, and reward winners with diamonds or wallet credit.</p>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-[#F5C518] text-black'
                    : 'bg-[#141414] border border-[#27272A] text-zinc-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Claims List */}
          <div className="card-gaming p-6">
            {loading ? (
              <div className="text-zinc-500 text-center py-8 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading...
              </div>
            ) : !claims.length ? (
              <div className="text-zinc-500 text-center py-12">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                No prize claims found.
              </div>
            ) : (
              <div className="space-y-3">
                {claims.map((c) => {
                  const meta = STATUS_META[c.status] || STATUS_META.PENDING;
                  const Icon = meta.icon;
                  return (
                    <div key={c.id} className={`p-4 rounded-lg border bg-black/30 border-[#27272A]`}>
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-white font-bold">{c.tournament.title}</div>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <div className="text-sm text-zinc-400 mt-1">
                            <span className="text-white">{c.user.name || 'Unknown'}</span> ({c.user.email})
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">
                            UID: <span className="text-white font-mono">{c.ffUid}</span> • IGN: <span className="text-white">{c.ffNickname}</span>
                          </div>
                          <div className="text-[10px] text-zinc-600 mt-1">
                            Submitted: {new Date(c.createdAt).toLocaleString()}
                          </div>
                          {c.rewardType && c.rewardAmount && (
                            <div className="text-[#F5C518] text-sm font-semibold mt-2">
                              Reward: {c.rewardType === 'WALLET' ? formatPKR(c.rewardAmount) + ' (wallet)' : `${c.rewardAmount} diamonds`}
                            </div>
                          )}
                          {c.note && (
                            <div className="text-zinc-400 text-xs mt-2 p-2 bg-black/40 rounded border border-[#27272A]">
                              User note: {c.note}
                            </div>
                          )}
                          {c.adminRemark && (
                            <div className="text-zinc-400 text-xs mt-2 p-2 bg-black/40 rounded border border-[#27272A]">
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              Admin: {c.adminRemark}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {c.status === 'PENDING' && (
                            <>
                              <GoldButton size="sm" onClick={() => openApprove(c)}>
                                Approve
                              </GoldButton>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:bg-red-500/10"
                                onClick={() => setRejecting(c)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-zinc-400"
                            onClick={() => setViewing(c)}
                          >
                            <ImageIcon className="w-4 h-4" /> View Screenshot
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-500/10"
                            onClick={() => deleteClaim(c)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={!!approving} onOpenChange={(o) => !o && setApproving(null)}>
        <DialogContent className="bg-[#141414] border-[#27272A]">
          <DialogHeader>
            <DialogTitle className="text-white">Approve Prize Claim</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitApprove} className="space-y-4">
            <div>
              <Label className="text-zinc-300">Reward Type *</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setRewardType('WALLET')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    rewardType === 'WALLET'
                      ? 'bg-[#F5C518] text-black'
                      : 'bg-black border border-[#27272A] text-zinc-400'
                  }`}
                >
                  Wallet (Rs.)
                </button>
                <button
                  type="button"
                  onClick={() => setRewardType('DIAMONDS')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    rewardType === 'DIAMONDS'
                      ? 'bg-[#F5C518] text-black'
                      : 'bg-black border border-[#27272A] text-zinc-400'
                  }`}
                >
                  Diamonds
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="rewardAmount" className="text-zinc-300">
                Reward Amount * {rewardType === 'WALLET' ? '(PKR)' : '(diamond count)'}
              </Label>
              <Input
                id="rewardAmount"
                type="number"
                step="0.01"
                min="0"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                required
                className="bg-black border-[#27272A] text-white"
              />
            </div>
            <div>
              <Label htmlFor="approveRemark" className="text-zinc-300">Admin Remark (optional)</Label>
              <Textarea
                id="approveRemark"
                value={approveRemark}
                onChange={(e) => setApproveRemark(e.target.value)}
                placeholder="Optional note to user..."
                className="bg-black border-[#27272A] text-white"
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setApproving(null)} className="text-zinc-400">
                Cancel
              </Button>
              <GoldButton type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve & Reward'}
              </GoldButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent className="bg-[#141414] border-[#27272A]">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Prize Claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Rejecting {rejecting?.user.name || rejecting?.user.email}'s claim for "{rejecting?.tournament.title}".
            </p>
            <div>
              <Label htmlFor="rejectRemark" className="text-zinc-300">Rejection Reason (optional)</Label>
              <Textarea
                id="rejectRemark"
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="Why is this claim being rejected?"
                className="bg-black border-[#27272A] text-white"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRejecting(null)} className="text-zinc-400">
                Cancel
              </Button>
              <Button onClick={submitReject} disabled={saving} className="bg-red-500 hover:bg-red-600 text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject Claim'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Screenshot Viewer */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="bg-[#141414] border-[#27272A] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Winning Screenshot</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="text-sm text-zinc-400">
                <span className="text-white">{viewing.user.name || viewing.user.email}</span> — {viewing.tournament.title}
              </div>
              <div className="text-xs text-zinc-500">
                UID: <span className="font-mono">{viewing.ffUid}</span> • IGN: {viewing.ffNickname}
              </div>
              <PrizeClaimScreenshot claimId={viewing.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PrizeClaimScreenshot({ claimId }: { claimId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    // Use a flag + async function instead of synchronous setState to avoid cascading renders
    (async () => {
      try {
        const res = await fetch(`/api/admin/prize-claims/${claimId}`);
        const d = await res.json();
        if (!mounted) return;
        if (d?.claim?.screenshot) {
          setSrc(d.claim.screenshot);
          setErr(null);
        } else {
          setErr('Screenshot not available');
        }
      } catch {
        if (mounted) setErr('Failed to load screenshot');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (err || !src) {
    return <div className="text-center text-red-400 py-12">{err || 'No screenshot'}</div>;
  }
  return <img src={src} alt="Winning screenshot" className="w-full rounded-lg border border-[#27272A]" />;
}
