'use client';
import { useEffect, useState } from 'react';
import { useNavigation, ViewName } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Users, ShoppingBag, DollarSign, Trophy, Activity, AlertCircle, LayoutDashboard, Package, Calendar, Bell, Tag, Settings, Flame, LogOut, ChevronRight, CreditCard, Wallet } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalTournaments: number;
  activeUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  totalTransactions: number;
}
interface DailyStat { date: string; count: number; revenue: number; }

export function AdminDashboardView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, logout, hydrate, hydrated } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) {
      navigate('login');
      return;
    }
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/stats')
        .then((r) => r.json())
        .then((d) => {
          setStats(d.stats);
          setDaily(d.dailyStats || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('landing');
  };

  const navItems: Array<{ view: ViewName; label: string; icon: React.ReactNode }> = [
    { view: 'admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { view: 'admin-users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { view: 'admin-orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { view: 'admin-payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { view: 'admin-products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { view: 'admin-tournaments', label: 'Tournaments', icon: <Trophy className="w-4 h-4" /> },
    { view: 'admin-results', label: 'Results', icon: <Activity className="w-4 h-4" /> },
    { view: 'admin-prize-claims', label: 'Prize Claims', icon: <Trophy className="w-4 h-4" /> },
    { view: 'admin-wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
    { view: 'admin-referrals', label: 'Referrals', icon: <Users className="w-4 h-4" /> },
    { view: 'admin-notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { view: 'admin-coupons', label: 'Coupons', icon: <Tag className="w-4 h-4" /> },
    { view: 'admin-settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: <Users className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: <ShoppingBag className="w-5 h-5" />, color: 'text-amber-400' },
    { label: 'Revenue', value: `Rs. ${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-400' },
    { label: 'Tournaments', value: stats?.totalTournaments ?? 0, icon: <Trophy className="w-5 h-5" />, color: 'text-purple-400' },
    { label: 'Active Users', value: stats?.activeUsers ?? 0, icon: <Activity className="w-5 h-5" />, color: 'text-pink-400' },
    { label: 'Pending Orders', value: stats?.pendingOrders ?? 0, icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-400' },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      <aside className="hidden md:block w-60 bg-[#0F0F0F] border-r border-[#27272A] p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="mb-6 p-3 bg-gradient-to-br from-amber-500/10 to-red-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-white font-bold text-sm">ADMIN PANEL</div>
              <div className="text-xs text-zinc-400">{user.email}</div>
            </div>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-zinc-400 hover:bg-white/5"
          >
            <ChevronRight className="w-4 h-4" /> User Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 mt-4"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-28 bg-[#141414]" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {statCards.map((s) => (
                  <Card key={s.label} className="bg-[#141414] border-[#27272A] p-5">
                    <div className={`mb-3 ${s.color}`}>{s.icon}</div>
                    <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-zinc-400 mt-1">{s.label}</div>
                  </Card>
                ))}
              </div>

              <Card className="bg-[#141414] border-[#27272A] p-6">
                <h2 className="text-lg font-bold text-white mb-4">Orders — Last 7 Days</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                    <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                    <YAxis stroke="#71717A" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#141414', border: '1px solid #27272A', borderRadius: 8, color: '#fff' }}
                      labelStyle={{ color: '#F5C518' }}
                    />
                    <Bar dataKey="count" name="Orders" fill="#F5C518" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F0F0F] border-t border-[#27272A] z-50 overflow-x-auto">
        <div className="flex gap-1 px-2 py-2 min-w-max">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400 hover:text-amber-400 shrink-0"
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
