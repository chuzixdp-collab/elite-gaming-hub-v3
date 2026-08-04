'use client';
import { useEffect, useState } from 'react';
import { useNavigation, ViewName } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { GoldButton } from '@/components/shared/GoldButton';
import { LayoutDashboard, ShoppingBag, Trophy, Bell, User as UserIcon, LogOut, Settings, Package, TrendingUp, Clock, ChevronRight, Flame, Wallet, Gift } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  createdAt: string;
  product: { id: string; name: string; imageUrl: string };
}

interface Registration {
  id: string;
  tournament: {
    id: string;
    title: string;
    type: string;
    startDateTime: string;
    status: string;
    roomId: string | null;
  };
  status: string;
  createdAt: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function DashboardView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, logout, hydrate, hydrated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !user) {
      navigate('login');
      return;
    }
    if (!user) return;

    Promise.all([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/notifications').then((r) => r.json()),
      fetch('/api/tournaments/my-registrations').then((r) => r.json()),
    ])
      .then(([ordersData, notifData, regData]) => {
        setOrders(ordersData.orders || []);
        setNotifications(notifData.notifications || []);
        setRegistrations(regData.registrations || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hydrated, user, navigate]);

  if (!hydrated) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Skeleton className="w-12 h-12 bg-[#141414]" /></div>;
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('landing');
  };

  const activeOrders = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  const totalSpent = orders.filter((o) => o.status === 'COMPLETED').reduce((sum, o) => sum + o.finalAmount, 0);
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const navItems: Array<{ view: ViewName; label: string; icon: React.ReactNode }> = [
    { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { view: 'orders', label: 'Order History', icon: <ShoppingBag className="w-4 h-4" /> },
    { view: 'tournaments', label: 'Tournaments', icon: <Trophy className="w-4 h-4" /> },
    { view: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { view: 'profile', label: 'Profile & Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:block w-64 bg-[#0F0F0F] border-r border-[#27272A] p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="mb-6 p-4 bg-gradient-to-br from-[#F5C518]/10 to-[#DC2626]/10 border border-[#F5C518]/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5C518] to-[#DC2626] flex items-center justify-center text-black font-bold">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" /> : (user.name?.charAt(0) || user.email.charAt(0))}
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold text-sm truncate">{user.name || 'Player'}</div>
              <div className="text-xs text-zinc-400 truncate">{user.email}</div>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {item.icon}
              {item.label}
              {item.view === 'notifications' && unreadNotifs > 0 && (
                <span className="ml-auto bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadNotifs}
                </span>
              )}
            </button>
          ))}
          {user.role === 'ADMIN' && (
            <button
              onClick={() => navigate('admin-dashboard')}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <Flame className="w-4 h-4" />
              Admin Panel
              <ChevronRight className="w-3 h-3 ml-auto" />
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-4"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome card */}
          <Card className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border-[#27272A] p-6 mb-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F5C518]/10 blur-3xl rounded-full" />
            <div className="relative">
              <div className="text-zinc-400 text-sm mb-1">Welcome back,</div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{user.name || 'Player'} 👋</h1>
              <p className="text-zinc-400">Ready to dominate the battleground today?</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <GoldButton size="sm" onClick={() => navigate('store')}><ShoppingBag className="w-4 h-4" /> Top Up Diamonds</GoldButton>
                <GoldButton size="sm" variant="outline-gold" onClick={() => navigate('tournaments')}><Trophy className="w-4 h-4" /> Join Tournament</GoldButton>
                <GoldButton size="sm" variant="outline-gold" onClick={() => navigate('wallet')}><Wallet className="w-4 h-4" /> My Wallet</GoldButton>
                <GoldButton size="sm" variant="outline-gold" onClick={() => navigate('referral')}><Gift className="w-4 h-4" /> Refer & Earn</GoldButton>
                <GoldButton size="sm" variant="outline-gold" onClick={() => navigate('prize-claims')}><Trophy className="w-4 h-4" /> My Prize Claims</GoldButton>
              </div>
            </div>
          </Card>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#141414] border-[#27272A] p-4">
              <Package className="w-5 h-5 text-[#F5C518] mb-2" />
              <div className="text-2xl font-bold text-white">{orders.length}</div>
              <div className="text-xs text-zinc-400">Total Orders</div>
            </Card>
            <Card className="bg-[#141414] border-[#27272A] p-4">
              <Clock className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-2xl font-bold text-white">{activeOrders.length}</div>
              <div className="text-xs text-zinc-400">Active Orders</div>
            </Card>
            <Card className="bg-[#141414] border-[#27272A] p-4">
              <Bell className="w-5 h-5 text-red-400 mb-2" />
              <div className="text-2xl font-bold text-white">{unreadNotifs}</div>
              <div className="text-xs text-zinc-400">Unread Notifications</div>
            </Card>
            <Card className="bg-[#141414] border-[#27272A] p-4">
              <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-2xl font-bold text-white">Rs. {totalSpent.toLocaleString()}</div>
              <div className="text-xs text-zinc-400">Total Spent</div>
            </Card>
          </div>

          {/* Current Orders */}
          <Card className="bg-[#141414] border-[#27272A] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Current Orders</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('orders')} className="text-[#F5C518] hover:text-[#FFD700]">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 bg-[#0F0F0F]" />)}
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm mb-3">No active orders.</p>
                <GoldButton size="sm" onClick={() => navigate('store')}>Browse Store</GoldButton>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activeOrders.slice(0, 5).map((o) => (
                  <div key={o.id} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                    <img src={o.product.imageUrl} alt={o.product.name} className="w-10 h-10 rounded object-contain bg-black" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold truncate">{o.product.name}</div>
                      <div className="text-xs text-zinc-500 font-mono">{o.orderNumber}</div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={o.status} />
                      <div className="text-xs text-zinc-500 mt-1">Rs. {o.finalAmount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Notifications */}
          <Card className="bg-[#141414] border-[#27272A] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Notifications</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('notifications')} className="text-[#F5C518] hover:text-[#FFD700]">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">No notifications yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg ${n.isRead ? 'bg-black/30' : 'bg-[#F5C518]/5 border border-[#F5C518]/20'}`}>
                    <div className="flex items-start gap-2">
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#F5C518] mt-1.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold">{n.title}</div>
                        <div className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-zinc-600 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Tournament Registrations */}
          <Card className="bg-[#141414] border-[#27272A] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">My Tournaments</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('tournaments')} className="text-[#F5C518] hover:text-[#FFD700]">
                Browse <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {loading ? (
              <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-16 bg-[#0F0F0F]" />)}</div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm mb-3">You haven&apos;t registered for any tournaments yet.</p>
                <GoldButton size="sm" onClick={() => navigate('tournaments')}>Browse Tournaments</GoldButton>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {registrations.slice(0, 6).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-3 bg-black/40 rounded-lg cursor-pointer hover:bg-black/60 transition-colors"
                    onClick={() => navigate('tournament-detail', { id: r.tournament.id })}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F5C518] to-[#DC2626] flex items-center justify-center text-black">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold truncate">{r.tournament.title}</div>
                      <div className="text-xs text-zinc-500">{new Date(r.tournament.startDateTime).toLocaleDateString()} • {r.tournament.type}</div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${
                        r.status === 'PENDING_APPROVAL' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : r.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : r.status === 'REJECTED' ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
                      }`}>
                        {r.status === 'PENDING_APPROVAL' ? 'Pending' : r.status === 'APPROVED' ? 'Approved' : r.status === 'REJECTED' ? 'Rejected' : r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F0F0F] border-t border-[#27272A] z-50">
        <div className="grid grid-cols-5">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className="flex flex-col items-center gap-0.5 py-2 text-zinc-400 hover:text-[#F5C518]"
            >
              {item.icon}
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
