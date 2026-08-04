'use client';
import { useNavigation } from '@/store/navigation';
import { Card } from '@/components/ui/card';
import { GoldButton } from './GoldButton';
import { StatusBadge } from './StatusBadge';
import { CountdownTimer } from './CountdownTimer';
import { Users, Trophy, DollarSign, Calendar } from 'lucide-react';
import { formatPKR } from '@/lib/constants';

interface TournamentCardProps {
  tournament: {
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
  };
  compact?: boolean;
}

export function TournamentCard({ tournament, compact = false }: TournamentCardProps) {
  const navigate = useNavigation((s) => s.navigate);
  const remaining = Math.max(0, tournament.totalSlots - tournament.registeredCount);
  const fillPercent = (tournament.registeredCount / tournament.totalSlots) * 100;

  return (
    <Card className="overflow-hidden bg-[#141414] border-[#27272A] hover:border-[#F5C518]/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('tournament-detail', { id: tournament.id })}>
      <div className="relative aspect-[3/1.2] overflow-hidden">
        <img src={tournament.bannerUrl} alt={tournament.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={tournament.type} type="tournament" />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg leading-tight">{tournament.title}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center bg-black/40 rounded-md p-2">
            <Calendar className="w-3 h-3 text-[#F5C518] mb-1" />
            <span className="text-zinc-400">Starts</span>
            <span className="text-white font-semibold">{new Date(tournament.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex flex-col items-center bg-black/40 rounded-md p-2">
            <DollarSign className="w-3 h-3 text-[#F5C518] mb-1" />
            <span className="text-zinc-400">Entry</span>
            <span className="text-white font-semibold">{tournament.entryFee === 0 ? 'FREE' : formatPKR(tournament.entryFee)}</span>
          </div>
          <div className="flex flex-col items-center bg-black/40 rounded-md p-2">
            <Trophy className="w-3 h-3 text-[#F5C518] mb-1" />
            <span className="text-zinc-400">Prize</span>
            <span className="text-white font-semibold">{formatPKR(tournament.prizePool)}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-400 flex items-center gap-1"><Users className="w-3 h-3" /> Slots</span>
            <span className="text-white font-semibold">{tournament.registeredCount}/{tournament.totalSlots}</span>
          </div>
          <div className="h-1.5 bg-black/60 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#F5C518] to-[#FFD700] transition-all" style={{ width: `${fillPercent}%` }} />
          </div>
          <div className="text-xs text-zinc-500 mt-1">{remaining} slots remaining</div>
        </div>

        {!compact && (
          <div className="pt-2">
            <div className="mb-3">
              <CountdownTimer targetDate={tournament.startDateTime} variant="compact" />
            </div>
            <GoldButton className="w-full" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate('tournament-detail', { id: tournament.id }); }}>
              View Details
            </GoldButton>
          </div>
        )}
      </div>
    </Card>
  );
}
