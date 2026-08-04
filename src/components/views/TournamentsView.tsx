'use client';
import { useEffect, useState } from 'react';
import { TournamentCard } from '@/components/shared/TournamentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar } from 'lucide-react';

interface Tournament {
  id: string;
  title: string;
  type: string;
  bannerUrl: string;
  startDateTime: string;
  entryFee: number;
  prizePool: number;
  totalSlots: number;
  registeredCount: number;
  status: string;
}

export function TournamentsView() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('ALL');

  useEffect(() => {
    fetch('/api/tournaments')
      .then((r) => r.json())
      .then((d) => setTournaments(d.tournaments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? tournaments : tournaments.filter((t) => t.type === filter);

  const filters = [
    { value: 'ALL' as const, label: 'All Tournaments' },
    { value: 'DAILY' as const, label: 'Daily' },
    { value: 'WEEKLY' as const, label: 'Weekly' },
    { value: 'MONTHLY' as const, label: 'Monthly Championship' },
  ];

  return (
    <div className="min-h-screen bg-black py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/30 mb-3">
            <Trophy className="w-3 h-3 text-[#DC2626]" />
            <span className="text-xs font-semibold text-[#DC2626] uppercase tracking-wider">Compete & Win</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Free Fire <span className="text-[#F5C518]">Tournaments</span>
          </h1>
          <p className="text-zinc-400">Join daily, weekly, and monthly tournaments with real cash prizes</p>
        </div>

        {/* Stats banner */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#141414] border border-[#27272A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5C518]">{tournaments.length}</div>
            <div className="text-xs text-zinc-400">Active Tournaments</div>
          </div>
          <div className="bg-[#141414] border border-[#27272A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5C518]">Rs. {tournaments.reduce((sum, t) => sum + t.prizePool, 0).toLocaleString()}</div>
            <div className="text-xs text-zinc-400">Total Prize Pool</div>
          </div>
          <div className="bg-[#141414] border border-[#27272A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5C518]">{tournaments.reduce((sum, t) => sum + t.registeredCount, 0)}</div>
            <div className="text-xs text-zinc-400">Total Players</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {filters.map((f) => (
            <Button
              key={f.value}
              onClick={() => setFilter(f.value)}
              variant={filter === f.value ? 'default' : 'outline'}
              className={
                filter === f.value
                  ? 'bg-[#F5C518] text-black hover:bg-[#FFD700] font-semibold'
                  : 'bg-transparent border-[#27272A] text-zinc-300 hover:text-white hover:border-[#F5C518]/50'
              }
            >
              {f.value !== 'ALL' && <Calendar className="w-3 h-3 mr-1" />}
              {f.label}
            </Button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 bg-[#141414]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No tournaments in this category right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
