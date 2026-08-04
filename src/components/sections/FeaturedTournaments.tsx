'use client';
import { useEffect, useState } from 'react';
import { TournamentCard } from '@/components/shared/TournamentCard';
import { GoldButton } from '@/components/shared/GoldButton';
import { useNavigation } from '@/store/navigation';
import { Skeleton } from '@/components/ui/skeleton';

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

export function FeaturedTournaments() {
  const navigate = useNavigation((s) => s.navigate);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tournaments')
      .then((r) => r.json())
      .then((d) => setTournaments(d.tournaments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-black to-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/30 mb-3">
              <span className="text-xs font-semibold text-[#DC2626] uppercase tracking-wider">Live & Upcoming</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Featured <span className="text-[#F5C518]">Tournaments</span>
            </h2>
            <p className="text-zinc-400">Compete for cash prizes. Daily, weekly, and monthly championships.</p>
          </div>
          <GoldButton variant="outline-gold" onClick={() => navigate('tournaments')}>
            View All Tournaments
          </GoldButton>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 bg-[#141414]" />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No tournaments available right now. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.slice(0, 3).map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
