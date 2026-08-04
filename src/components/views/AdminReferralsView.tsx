'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { motion } from 'framer-motion';
import { Users, Gift, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { formatPKR } from '@/lib/constants';

interface Referral {
  id: string;
  status: string;
  rewardAmount: number;
  createdAt: string;
  rewardedAt: string | null;
  referrer: { id: string; name: string | null; email: string; referralCode: string };
  referred: { id: string; name: string | null; email: string };
}

interface Stats {
  total: number;
  pending: number;
  rewarded: number;
  blocked: number;
  totalPaidOut: number;
}

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PENDING:  { label: 'Pending',  icon: Clock,        color: '#a1a1aa' },
  REWARDED: { label: 'Rewarded', icon: CheckCircle2, color: '#10b981' },
  BLOCKED:  { label: 'Blocked',  icon: XCircle,      color: '#ef4444' },
};

export function AdminReferralsView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) {
      navigate('login');
      return;
    }
    if (user?.role === 'ADMIN') fetchReferrals();
  }, [hydrated, user, navigate]);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/referrals');
      const data = await res.json();
      setReferrals(data.referrals || []);
      setStats(data.stats || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0A] py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-extrabold text-white mb-2">Referral Rewards Management</h1>
          <p className="text-zinc-400 mb-6 text-sm">
            View all referrals across the platform. Referrers earn Rs.5 in their wallet when their referred user completes a first successful transaction.
          </p>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <StatCard label="Total Referrals" value={stats.total} icon={Users} color="#a78bfa" />
              <StatCard label="Pending" value={stats.pending} icon={Clock} color="#a1a1aa" />
              <StatCard label="Rewarded" value={stats.rewarded} icon={CheckCircle2} color="#10b981" />
              <StatCard label="Blocked" value={stats.blocked} icon={XCircle} color="#ef4444" />
              <StatCard label="Total Paid Out" value={formatPKR(stats.totalPaidOut)} icon={Gift} color="#F5C518" />
            </div>
          )}

          <div className="card-gaming p-6">
            <h2 className="text-xl font-bold text-white mb-4">All Referrals</h2>
            {loading ? (
              <div className="text-zinc-500 text-center py-8 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading...
              </div>
            ) : !referrals.length ? (
              <div className="text-zinc-500 text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                No referrals yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#27272A] text-left text-zinc-400">
                      <th className="p-3">Referrer</th>
                      <th className="p-3">Referred</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Reward</th>
                      <th className="p-3">Created</th>
                      <th className="p-3">Rewarded At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((r) => {
                      const meta = STATUS_META[r.status] || STATUS_META.PENDING;
                      const Icon = meta.icon;
                      return (
                        <tr key={r.id} className="border-b border-[#1F1F1F] hover:bg-[#1F1F1F]/50">
                          <td className="p-3 text-white">{r.referrer.name || r.referrer.email}</td>
                          <td className="p-3 text-zinc-400">{r.referred.name || r.referred.email}</td>
                          <td className="p-3 font-mono text-[#F5C518]">{r.referrer.referralCode}</td>
                          <td className="p-3">
                            <span
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                            >
                              <Icon className="w-3 h-3" />
                              {meta.label}
                            </span>
                          </td>
                          <td className="p-3 text-right text-[#F5C518] font-bold">
                            {r.status === 'REWARDED' ? `+${formatPKR(r.rewardAmount)}` : `—`}
                          </td>
                          <td className="p-3 text-zinc-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-zinc-500 text-xs">
                            {r.rewardedAt ? new Date(r.rewardedAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="card-gaming p-4">
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}
