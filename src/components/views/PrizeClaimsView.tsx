'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { motion } from 'framer-motion';
import {
  Trophy,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { GoldButton } from '@/components/shared/GoldButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPKR } from '@/lib/constants';

interface Tournament {
  id: string;
  title: string;
  type: string;
}

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
  tournament: { id: string; title: string; type: string };
}

export function PrizeClaimsView() {
  const navigate = useNavigation((s) => s.navigate);
  const params = useNavigation((s) => s.params);
  const { user, hydrate, hydrated } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [claims, setClaims] = useState<PrizeClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [tournamentId, setTournamentId] = useState('');
  const [ffUid, setFfUid] = useState('');
  const [ffNickname, setFfNickname] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !user) {
      navigate('login');
      return;
    }
    if (user) {
      fetchTournaments();
      fetchClaims();
      // Prefill FF UID/nickname from user
      if (user.ffUid) setFfUid(user.ffUid);
      if (user.ffNickname) setFfNickname(user.ffNickname);
    }
  }, [hydrated, user, navigate]);

  // Prefill tournament from params (if navigated from a tournament page)
  useEffect(() => {
    if (params.tournamentId && typeof params.tournamentId === 'string') {
      setTournamentId(params.tournamentId);
    }
  }, [params.tournamentId]);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prize-claims');
      const data = await res.json();
      setClaims(data.claims || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      toast.error('Image too large (max 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.onerror = () => toast.error('Failed to read image');
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournamentId) {
      toast.error('Select a tournament');
      return;
    }
    if (!/^\d{8,12}$/.test(ffUid)) {
      toast.error('FF UID must be 8-12 digits');
      return;
    }
    if (!ffNickname.trim()) {
      toast.error('In-game name is required');
      return;
    }
    if (!screenshot) {
      toast.error('Please upload your winning screenshot');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/prize-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, ffUid, ffNickname, screenshot, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      toast.success('Prize claim submitted! Admin will review it within 1-24 hours.');
      setScreenshot(null);
      setNote('');
      // Reset file input
      const fileInput = document.getElementById('screenshot') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      fetchClaims();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-extrabold text-white mb-2">My Prize Claims</h1>
          <p className="text-zinc-400 mb-8 text-sm">
            Won a tournament? Submit your Free Fire UID, in-game name, and a screenshot of your winning rank. Admin will review and approve your prize.
          </p>

          {/* Submission Form */}
          <div className="card-gaming p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F5C518]" />
              Submit a Prize Claim
            </h2>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Tournament *</Label>
                <select
                  value={tournamentId}
                  onChange={(e) => setTournamentId(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 bg-black border border-[#27272A] rounded-md text-white"
                >
                  <option value="">— Select tournament —</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ffUid" className="text-zinc-300">Free Fire UID *</Label>
                  <Input
                    id="ffUid"
                    value={ffUid}
                    onChange={(e) => setFfUid(e.target.value)}
                    placeholder="8-12 digit UID"
                    required
                    className="bg-black border-[#27272A] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="ffNickname" className="text-zinc-300">In-game Name *</Label>
                  <Input
                    id="ffNickname"
                    value={ffNickname}
                    onChange={(e) => setFfNickname(e.target.value)}
                    placeholder="Your FF nickname"
                    required
                    className="bg-black border-[#27272A] text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="screenshot" className="text-zinc-300">Winning Screenshot *</Label>
                <div className="mt-1 flex items-center gap-3">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onFileChange}
                    required
                    className="bg-black border-[#27272A] text-white file:bg-[#F5C518] file:text-black file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:cursor-pointer"
                  />
                  {screenshot && (
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-[#27272A] shrink-0">
                      <img src={screenshot} alt="Screenshot preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">Max 5MB. PNG / JPG / WebP.</p>
              </div>

              <div>
                <Label htmlFor="note" className="text-zinc-300">Note (optional)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any additional info for admin (e.g. your rank, kills, match ID)"
                  className="bg-black border-[#27272A] text-white"
                  rows={3}
                />
              </div>

              <GoldButton type="submit" disabled={submitting} className="w-full md:w-auto">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Submit Claim</>
                )}
              </GoldButton>
            </form>
          </div>

          {/* My Claims History */}
          <div className="card-gaming p-6">
            <h2 className="text-xl font-bold text-white mb-4">Claim History</h2>
            {loading ? (
              <div className="text-zinc-500 text-center py-8">Loading...</div>
            ) : !claims.length ? (
              <div className="text-zinc-500 text-center py-12">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                No prize claims yet. Submit your first claim above!
              </div>
            ) : (
              <div className="space-y-3">
                {claims.map((c) => {
                  const meta = CLAIM_STATUS_META[c.status];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-lg border bg-black/30 ${meta.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-white font-bold text-sm">{c.tournament.title}</div>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <div className="text-zinc-500 text-xs mt-1">
                            UID: {c.ffUid} • IGN: {c.ffNickname}
                          </div>
                          <div className="text-zinc-600 text-[10px] mt-1">
                            Submitted: {new Date(c.createdAt).toLocaleString()}
                            {c.reviewedAt && ` • Reviewed: ${new Date(c.reviewedAt).toLocaleString()}`}
                          </div>
                          {c.rewardType && c.rewardAmount && (
                            <div className="text-[#F5C518] text-sm font-semibold mt-2">
                              Reward: {c.rewardType === 'WALLET' ? formatPKR(c.rewardAmount) + ' (wallet)' : `${c.rewardAmount} diamonds`}
                            </div>
                          )}
                          {c.adminRemark && (
                            <div className="text-zinc-400 text-xs mt-2 p-2 bg-black/40 rounded border border-[#27272A]">
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              Admin: {c.adminRemark}
                            </div>
                          )}
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

const CLAIM_STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string; border: string }> = {
  PENDING:  { label: 'Pending Review',  icon: Clock,         color: '#a1a1aa', border: 'border-[#27272A]' },
  APPROVED: { label: 'Approved',         icon: CheckCircle2,  color: '#10b981', border: 'border-green-500/40' },
  REJECTED: { label: 'Rejected',         icon: XCircle,       color: '#ef4444', border: 'border-red-500/40' },
};
