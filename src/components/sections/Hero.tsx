'use client';
import { useNavigation } from '@/store/navigation';
import { GoldButton } from '@/components/shared/GoldButton';
import { AnimatedBackground } from './AnimatedBackground';
import { Flame, Trophy, ShoppingBag, Zap, Shield, ChevronRight } from 'lucide-react';

export function Hero() {
  const navigate = useNavigation((s) => s.navigate);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <AnimatedBackground />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/30 mb-6">
            <Flame className="w-4 h-4 text-[#F5C518]" />
            <span className="text-xs font-semibold text-[#F5C518] uppercase tracking-wider">#1 Free Fire Top-Up Platform 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-7xl font-black text-white leading-tight mb-6">
            DOMINATE THE
            <br />
            <span className="bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#DC2626] bg-clip-text text-transparent">
              BATTLEGROUND
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Instant Free Fire diamond top-ups, weekly & monthly memberships, and competitive tournaments with real cash prizes. Join 30+ elite players today.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <GoldButton size="lg" onClick={() => navigate('store')} className="text-base px-8">
              <ShoppingBag className="w-5 h-5" /> Browse Store
            </GoldButton>
            <GoldButton size="lg" variant="outline-gold" onClick={() => navigate('tournaments')} className="text-base px-8">
              <Trophy className="w-5 h-5" /> Join Tournament
            </GoldButton>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <Zap className="w-6 h-6 text-[#F5C518] mb-2" />
              <div className="text-2xl font-bold text-white">Instant</div>
              <div className="text-xs text-zinc-500">Delivery</div>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-6 h-6 text-[#F5C518] mb-2" />
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-zinc-500">Secure</div>
            </div>
            <div className="flex flex-col items-center">
              <Trophy className="w-6 h-6 text-[#F5C518] mb-2" />
              <div className="text-2xl font-bold text-white">Rs. 15,000</div>
              <div className="text-xs text-zinc-500">Prize Pool</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
        <ChevronRight className="w-6 h-6 text-zinc-500 animate-bounce rotate-90" />
      </div>
    </section>
  );
}
