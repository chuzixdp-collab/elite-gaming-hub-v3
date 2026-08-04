'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { GoldButton } from '@/components/shared/GoldButton';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { Menu, X, Flame, LayoutDashboard, Trophy, ShoppingBag, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const navigate = useNavigation((s) => s.navigate);
  const currentView = useNavigation((s) => s.view);
  const { user, logout, hydrate, hydrated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems: Array<{ view: 'landing' | 'tournaments' | 'store'; label: string; icon: React.ReactNode }> = [
    { view: 'landing', label: 'Home', icon: <Flame className="w-4 h-4" /> },
    { view: 'tournaments', label: 'Tournaments', icon: <Trophy className="w-4 h-4" /> },
    { view: 'store', label: 'Store', icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('landing');
  };

  const goDashboard = () => navigate(user?.role === 'ADMIN' ? 'admin-dashboard' : 'dashboard');

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-[#27272A]' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate('landing')} className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Elite Gaming Hub"
              className="w-10 h-10 rounded-lg object-contain shadow-[0_0_15px_rgba(245,197,24,0.4)]"
            />
            <div className="text-left">
              <div className="text-white font-bold text-base leading-none">ELITE</div>
              <div className="text-[#F5C518] text-[10px] font-semibold tracking-widest leading-none">GAMING HUB</div>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => navigate(item.view)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  currentView === item.view
                    ? 'text-[#F5C518] bg-[#F5C518]/10'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {hydrated && user ? (
              <>
                <NotificationBell />
                {user.role === 'ADMIN' && (
                  <Button
                    onClick={() => navigate('admin-dashboard')}
                    variant="ghost"
                    size="sm"
                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  >
                    <Shield className="w-4 h-4" /> Admin
                  </Button>
                )}
                <Button
                  onClick={goDashboard}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/5"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : hydrated ? (
              <>
                <Button onClick={() => navigate('login')} variant="ghost" size="sm" className="text-white hover:bg-white/5">
                  Login
                </Button>
                <GoldButton size="sm" onClick={() => navigate('signup')}>
                  Sign Up
                </GoldButton>
              </>
            ) : (
              <div className="w-20 h-8" />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {hydrated && user && <NotificationBell />}
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="text-white">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#27272A] py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => { navigate(item.view); setMobileOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <div className="pt-2 mt-2 border-t border-[#27272A] space-y-2">
              {hydrated && user ? (
                <>
                  <button onClick={() => { goDashboard(); setMobileOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-white hover:bg-white/5">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </button>
                  <button onClick={() => { navigate('profile'); setMobileOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-white hover:bg-white/5">
                    <UserIcon className="w-4 h-4" /> Profile
                  </button>
                  {user.role === 'ADMIN' && (
                    <button onClick={() => { navigate('admin-dashboard'); setMobileOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-amber-400 hover:bg-amber-500/10">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </button>
                  )}
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 space-y-2">
                    <GoldButton className="w-full" onClick={() => { navigate('login'); setMobileOpen(false); }}>Login</GoldButton>
                    <Button className="w-full bg-transparent border border-[#F5C518]/50 text-[#F5C518] hover:bg-[#F5C518]/10" onClick={() => { navigate('signup'); setMobileOpen(false); }}>
                      Sign Up
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
