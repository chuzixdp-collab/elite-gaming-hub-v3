'use client';

import { motion } from 'framer-motion';
import { useNavigation } from '@/store/navigation';
import { AnimatedBackground } from '@/components/sections/AnimatedBackground';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const navigate = useNavigation((s) => s.navigate);
  const back = useNavigation((s) => s.back);
  const canGoBack = useNavigation((s) => s.canGoBack());

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-gaming p-6 sm:p-8"
        >
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2.5 mb-6"
          >
            <img
              src="/logo.png"
              alt="Elite Gaming Hub"
              className="w-12 h-12 rounded-lg object-contain glow-gold"
            />
            <div className="font-extrabold text-white text-lg">
              ELITE<span className="text-gradient-gold">GAMING</span>
            </div>
          </button>

          <h1 className="text-2xl font-extrabold text-white mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-zinc-400 mb-6">{subtitle}</p>}

          {children}

          {footer && <div className="mt-6 pt-6 border-t border-[#27272A] text-center text-sm text-zinc-400">{footer}</div>}
        </motion.div>

        {canGoBack && (
          <button
            onClick={back}
            className="mt-4 mx-auto block text-sm text-zinc-500 hover:text-[#F5C518] transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </section>
  );
}
