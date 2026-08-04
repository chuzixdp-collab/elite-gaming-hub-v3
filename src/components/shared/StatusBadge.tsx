'use client';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, TOURNAMENT_TYPE_LABELS, TOURNAMENT_TYPE_COLORS } from '@/lib/constants';

export function StatusBadge({ status, type = 'order' }: { status: string; type?: 'order' | 'tournament' }) {
  if (type === 'tournament') {
    return (
      <span className={cn('inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border', TOURNAMENT_TYPE_COLORS[status] || 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30')}>
        {TOURNAMENT_TYPE_LABELS[status] || status}
      </span>
    );
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border', ORDER_STATUS_COLORS[status] || 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30')}>
      {ORDER_STATUS_LABELS[status] || status}
    </span>
  );
}
