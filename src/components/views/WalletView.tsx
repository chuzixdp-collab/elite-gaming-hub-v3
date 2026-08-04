'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { motion } from 'framer-motion';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet as WalletIcon,
  Gift,
  Trophy,
  Users,
  ShoppingBag,
  RefreshCw,
  Settings,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { GoldButton } from '@/components/shared/GoldButton';
import { formatPKR } from '@/lib/constants';

interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  reason: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
}

interface WalletData {
  wallet: { id: string; balance: number; currency: string };
  transactions: WalletTransaction[];
  summary: {
    totalCredits: number;
    totalDebits: number;
    net: number;
    currentBalance: number;
  };
}

const REASON_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  REFERRAL_REWARD:    { label: 'Referral Reward',     icon: Users,        color: '#10b981' },
  PRIZE_REWARD:       { label: 'Prize Reward',         icon: Trophy,       color: '#F5C518' },
  PURCHASE_DISCOUNT:  { label: 'Purchase Discount',    icon: ShoppingBag,  color: '#ef4444' },
  ADMIN_ADJUST:       { label: 'Admin Adjustment',     icon: Settings,     color: '#a78bfa' },
  REFUND:             { label: 'Refund',               icon: RefreshCw,    color: '#10b981' },
};

export function WalletView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !user) {
      navigate('login');
      return;
    }
    if (user) fetchWallet();
  }, [hydrated, user, navigate]);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated || !user) return null;

  const balance = data?.wallet.balance ?? 0;
  const summary = data?.summary;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0A] py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-extrabold text-white mb-2">My Wallet</h1>
          <p className="text-zinc-400 mb-8 text-sm">
            Use your wallet balance as a discount at checkout for diamond purchases, memberships, and tournament entry fees.
          </p>

          {/* Balance Card */}
          <div className="card-gaming p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F5C518]/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <WalletIcon className="w-4 h-4" />
                  Available Balance
                </div>
                <div className="text-5xl font-extrabold text-[#F5C518]">
                  {formatPKR(balance)}
                </div>
                <div className="text-zinc-500 text-xs mt-2">
                  Wallet balance can only be used as a discount at checkout.
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <GoldButton variant="outline-gold" onClick={() => navigate('store')}>
                  <ShoppingBag className="w-4 h-4" /> Buy Diamonds
                </GoldButton>
                <GoldButton variant="outline-gold" onClick={() => navigate('referral')}>
                  <Users className="w-4 h-4" /> Earn Rs.5 per Referral
                </GoldButton>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <SummaryCard
                label="Total Credits"
                value={formatPKR(summary.totalCredits)}
                icon={ArrowUpCircle}
                color="#10b981"
              />
              <SummaryCard
                label="Total Debits"
                value={formatPKR(summary.totalDebits)}
                icon={ArrowDownCircle}
                color="#ef4444"
              />
              <SummaryCard
                label="Net Activity"
                value={formatPKR(summary.net)}
                icon={WalletIcon}
                color="#F5C518"
              />
              <SummaryCard
                label="Current Balance"
                value={formatPKR(summary.currentBalance)}
                icon={Gift}
                color="#a78bfa"
              />
            </div>
          )}

          {/* Transaction History */}
          <div className="card-gaming p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Transaction History</h2>
              <button
                onClick={fetchWallet}
                className="text-zinc-400 hover:text-[#F5C518] transition-colors text-sm flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-zinc-500 text-center py-8">Loading...</div>
            ) : !data?.transactions.length ? (
              <div className="text-zinc-500 text-center py-12">
                <WalletIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                No transactions yet. Earn rewards through referrals or tournament wins!
              </div>
            ) : (
              <div className="space-y-2">
                {data.transactions.map((tx) => {
                  const meta = REASON_META[tx.reason] || REASON_META.ADMIN_ADJUST;
                  const Icon = meta.icon;
                  const isCredit = tx.type === 'CREDIT';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[#27272A] bg-black/30 hover:border-[#F5C518]/30 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-sm truncate">
                          {meta.label}
                        </div>
                        <div className="text-zinc-500 text-xs truncate">
                          {tx.description || '—'}
                        </div>
                        <div className="text-zinc-600 text-[10px] mt-0.5">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={`font-bold text-sm ${isCredit ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {isCredit ? '+' : '−'} {formatPKR(tx.amount)}
                        </div>
                        <div className="text-zinc-500 text-[10px]">
                          Bal: {formatPKR(tx.balanceAfter)}
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

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
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
