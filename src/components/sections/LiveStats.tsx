'use client';
import { useEffect, useRef, useState } from 'react';
import { Users, Trophy, Gem, DollarSign } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
}

const stats: Stat[] = [
  { label: 'Active Players', value: 30, icon: <Users className="w-6 h-6" /> },
  { label: 'Tournaments Hosted', value: 1, icon: <Trophy className="w-6 h-6" /> },
  { label: 'Diamonds Delivered', value: 40000, icon: <Gem className="w-6 h-6" /> },
  { label: 'Total Prize Pool', value: 15000, prefix: 'Rs. ', icon: <DollarSign className="w-6 h-6" /> },
];

function useCountUp(target: number, durationMs = 2000, start: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [target, durationMs, start]);
  return value;
}

function StatCard({ stat, start }: { stat: Stat; start: boolean }) {
  const v = useCountUp(stat.value, 2000, start);
  const display = stat.value < 10 ? v.toFixed(1) : Math.floor(v).toLocaleString();

  return (
    <div className="bg-[#141414] border border-[#27272A] rounded-xl p-6 hover:border-[#F5C518]/50 transition-all duration-300 group">
      <div className="w-12 h-12 rounded-lg bg-[#F5C518]/10 border border-[#F5C518]/30 flex items-center justify-center text-[#F5C518] mb-4 group-hover:scale-110 transition-transform">
        {stat.icon}
      </div>
      <div className="text-3xl md:text-4xl font-bold text-white mb-1">
        {stat.prefix}{display}{stat.suffix}
      </div>
      <div className="text-sm text-zinc-400">{stat.label}</div>
    </div>
  );
}

export function LiveStats() {
  const [start, setStart] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStart(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-20 bg-black">
      <div ref={ref} className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Trusted by <span className="text-[#F5C518]">Thousands</span> of Gamers
          </h2>
          <p className="text-zinc-400">Real-time stats from our growing community</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} start={start} />
          ))}
        </div>
      </div>
    </section>
  );
}
