'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { motion } from 'framer-motion';
import { Copy, Users, Gift, CheckCircle2, Clock, XCircle, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { GoldButton } from '@/components/shared/GoldButton';
import { formatPKR } from '@/lib/constants';

interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  stats: {
    total: number;
    rewarded: number;
    pending: number;
    blocked: number;
    totalEarnings: number;
  };
  referrals: Array<{
    id: string;
    status: string;
    rewardAmount: number;
    createdAt: string;
    rewardedAt: string | null;
    referred: { name: string | null; email: string; createdAt: string } | null;
  }>;
}

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PENDING:  { label: 'Pending — waiting for first transaction', icon: Clock,        color: '#a1a1aa' },
  REWARDED: { label: 'Rewarded',                                  icon: CheckCircle2, color: '#10b981' },
  BLOCKED:  { label: 'Blocked',                                    icon: XCircle,      color: '#ef4444' },
};

export function ReferralView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !user) {
      navigate('login');
      return;
    }
    if (user) fetchReferral();
  }, [hydrated, user, navigate]);

  const fetchReferral = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/referral/me');
      const json = await res.json();
      setInfo(json);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load referral info');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    }
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0A] py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-extrabold text-white mb-2">Referral Program</h1>
          <p className="text-zinc-400 mb-8 text-sm">
            Invite friends with your unique referral code. When they sign up AND complete their first successful purchase or tournament registration, you earn Rs.5 in your wallet.
          </p>

          {/* Referral Code Card */}
          <div className="card-gaming p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#10b981]/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                <Gift className="w-4 h-4" />
                Your Referral Code
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="text-4xl md:text-5xl font-extrabold text-[#F5C518] tracking-wider">
                  {info?.referralCode || '...'}
                </div>
                <GoldButton
                  variant="outline-gold"
                  onClick={() => info && copyToClipboard(info.referralCode, 'Referral code')}
                >
                  <Copy className="w-4 h-4" /> Copy Code
                </GoldButton>
              </div>

              <div className="border-t border-[#27272A] pt-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <LinkIcon className="w-4 h-4" />
                  Your Referral Link
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 px-3 py-2 bg-black/40 border border-[#27272A] rounded-md text-sm text-zinc-300 truncate font-mono">
                    {info?.referralLink || '...'}
                  </div>
                  <GoldButton
                    variant="outline-gold"
                    onClick={() => info && copyToClipboard(info.referralLink, 'Referral link')}
                  >
                    <Copy className="w-4 h-4" /> Copy Link
                  </GoldButton>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#F5C518]/5 border border-[#F5C518]/30 rounded-lg">
                <div className="text-sm text-[#F5C518] font-semibold mb-1">How it works</div>
                <ol className="text-xs text-zinc-400 space-y-1 list-decimal list-inside">
                  <li>Share your referral code or link with friends.</li>
                  <li>They sign up using your code (during registration).</li>
                  <li>When they complete their FIRST successful payment (diamond purchase OR tournament entry), you earn Rs.5 in your wallet.</li>
                  <li>Self-referrals are blocked automatically.</li>
                  <li>Only the FIRST successful transaction triggers the reward.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total Referrals" value={info?.stats.total ?? 0} icon={Users} color="#a78bfa" />
            <StatCard label="Rewarded"        value={info?.stats.rewarded ?? 0} icon={CheckCircle2} color="#10b981" />
            <StatCard label="Pending"         value={info?.stats.pending ?? 0} icon={Clock} color="#a1a1aa" />
            <StatCard
              label="Total Earned"
              value={formatPKR(info?.stats.totalEarnings ?? 0)}
              icon={Gift}
              color="#F5C518"
            />
          </div>

          {/* Referral List */}
          <div className="card-gaming p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Referrals</h2>
            {loading ? (
              <div className="text-zinc-500 text-center py-8">Loading...</div>
            ) : !info?.referrals.length ? (
              <div className="text-zinc-500 text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                No referrals yet. Share your code to start earning!
              </div>
            ) : (
              <div className="space-y-2">
                {info.referrals.map((r) => {
                  const meta = STATUS_META[r.status] || STATUS_META.PENDING;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[#27272A] bg-black/30"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-sm">
                          {r.referred?.name || r.referred?.email || 'Anonymous'}
                        </div>
                        <div className="text-zinc-500 text-xs">{meta.label}</div>
                        <div className="text-zinc-600 text-[10px] mt-0.5">
                          Joined: {new Date(r.createdAt).toLocaleDateString()}
                          {r.rewardedAt && ` • Rewarded: ${new Date(r.rewardedAt).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`font-bold text-sm ${r.status === 'REWARDED' ? 'text-green-400' : 'text-zinc-500'}`}>
                          +{formatPKR(r.rewardAmount)}
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
