'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Store, Trophy, User, LogOut, Shield, LayoutDashboard, ShoppingBag, Bell } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useNavigation, type ViewName } from '@/store/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { user, logout: doLogout } = useAuth();
  const navigate = useNavigation((s) => s.navigate);
  const view = useNavigation((s) => s.view);

  function go(v: ViewName) {
    navigate(v);
    onClose();
  }

  async function logout() {
    await doLogout();
    toast.success('Logged out');
    go('landing');
  }

  const items: Array<{ label: string; icon: typeof Home; view: ViewName }> = [
    { label: 'Home', icon: Home, view: 'landing' },
    { label: 'Store', icon: Store, view: 'store' },
    { label: 'Tournaments', icon: Trophy, view: 'tournaments' },
  ];

  const userItems: Array<{ label: string; icon: typeof Home; view: ViewName }> = user
    ? [
        { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
        { label: 'My Orders', icon: ShoppingBag, view: 'orders' },
        { label: 'Notifications', icon: Bell, view: 'notifications' },
        { label: 'Profile', icon: User, view: 'profile' },
      ]
    : [];

  const adminItems: Array<{ label: string; icon: typeof Home; view: ViewName }> = user?.role === 'ADMIN' ? [{ label: 'Admin Panel', icon: Shield, view: 'admin-dashboard' }] : [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed top-0 right-0 bottom-0 w-72 max-w-[80vw] bg-[#0F0F0F] border-l border-[#27272A] z-50 md:hidden flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Elite Gaming Hub" className="w-8 h-8 rounded-md object-contain" />
                <span className="font-extrabold text-white">
                  ELITE<span className="text-gradient-gold">GAMING</span>
                </span>
              </div>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-[#1F1F1F]">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto scroll-gaming p-2">
              {items.map((it) => (
                <NavBtn key={it.view} {...it} active={view === it.view} onClick={() => go(it.view)} />
              ))}
              {user && (
                <>
                  <div className="h-px bg-[#27272A] my-2" />
                  <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-zinc-600">Account</div>
                  {userItems.map((it) => (
                    <NavBtn key={it.view} {...it} active={view === it.view} onClick={() => go(it.view)} />
                  ))}
                </>
              )}
              {adminItems.length > 0 && (
                <>
                  <div className="h-px bg-[#27272A] my-2" />
                  <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-zinc-600">Admin</div>
                  {adminItems.map((it) => (
                    <NavBtn key={it.view} {...it} active={view === it.view} onClick={() => go(it.view)} accent />
                  ))}
                </>
              )}
            </nav>
            <div className="p-3 border-t border-[#27272A]">
              {user ? (
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-md"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => go('login')}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white border border-[#27272A] rounded-md"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => go('signup')}
                    className="flex-1 btn-gold px-4 py-2 text-sm rounded-md font-semibold"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NavBtn({
  label,
  icon: Icon,
  active,
  onClick,
  accent,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
        active
          ? accent
            ? 'bg-[#F5C518]/10 text-[#F5C518]'
            : 'bg-[#F5C518]/10 text-[#F5C518]'
          : accent
          ? 'text-[#F5C518] hover:bg-[#1F1F1F]'
          : 'text-zinc-200 hover:bg-[#1F1F1F] hover:text-white',
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
