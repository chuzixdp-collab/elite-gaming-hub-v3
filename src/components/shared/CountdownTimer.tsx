'use client';
import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
  variant?: 'compact' | 'full';
}

export function CountdownTimer({ targetDate, variant = 'full' }: CountdownTimerProps) {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return <span className="text-red-400 font-semibold text-sm">Started / Ended</span>;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (variant === 'compact') {
    return (
      <span className="text-amber-400 font-mono text-sm font-semibold">
        {days > 0 && `${days}d `}
        {String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
      </span>
    );
  }

  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Mins', value: minutes },
    { label: 'Secs', value: seconds },
  ];

  return (
    <div className="flex gap-2">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex flex-col items-center bg-black/60 border border-[#F5C518]/30 rounded-lg px-3 py-2 min-w-[58px]"
        >
          <span className="text-xl font-bold text-[#F5C518] font-mono tabular-nums">
            {String(u.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-zinc-400">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
