'use client';
import { useEffect, useState, useCallback } from 'react';
import { useNavigation, ViewName } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  CreditCard, Loader2, CheckCircle2, XCircle, Trash2, Eye, Search,
  Filter, LayoutDashboard, Users, ShoppingBag, Package, Trophy, Activity,
  Bell, Tag, Settings, Flame, LogOut, ChevronRight, Clock, Image as ImageIcon, X,
} from 'lucide-react';
import { formatPKR, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/lib/constants';

interface AdminPayment {
  id: string;
  userId: string;
  packageId: string | null;
  tournamentId: string | null;
  orderId: string | null;
  amount: number;
  currency: string;
  transactionId: string;
  screenshot: string;
  paymentMethod: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminRemark: string | null;
  createdAt: string;
  approvedAt: string | null;
  user: { id: string; email: string; name: string | null; ffUid: string | null; ffNickname: string | null };
  package: { id: string; name: string; diamonds: number | null; bonusDiamonds: number; price: number } | null;
  tournament: { id: string; title: string; type: string; startDateTime: string } | null;
}

interface Stats {
  [key: string]: { count: number; total: number };
}

export function AdminPaymentsView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, logout, hydrate, hydrated } = useAuth();

  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // Detail dialog
  const [detailPayment, setDetailPayment] = useState<AdminPayment | null>(null);
  const [rejectPayment, setRejectPayment] = useState<AdminPayment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { hydrate(); }, [hydrate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setPayments(data.payments || []);
      setStats(data.stats || {});
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, search, page]);

  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) {
      navigate('login');
      return;
    }
    if (user?.role === 'ADMIN') load();
  }, [hydrated, user, navigate, load]);

  if (!hydrated || !user) return null;

  const handleApprove = async (p: AdminPayment) => {
    setActionLoading(`approve-${p.id}`);
    try {
      const res = await fetch(`/api/admin/payments/${p.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remark: 'Approved from admin panel' }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Approve failed');
      }
      toast.success('Payment approved', { description: 'User has been notified.' });
      setDetailPayment(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approve failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectPayment) return;
    if (rejectReason.trim().length < 2) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setActionLoading(`reject-${rejectPayment.id}`);
    try {
      const res = await fetch(`/api/admin/payments/${rejectPayment.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Reject failed');
      }
      toast.success('Payment rejected', { description: 'User has been notified.' });
      setRejectPayment(null);
      setRejectReason('');
      setDetailPayment(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reject failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (p: AdminPayment) => {
    if (!confirm(`Delete this payment record?\nTID: ${p.transactionId}\nAmount: Rs. ${p.amount}\nThis cannot be undone.`)) return;
    setActionLoading(`delete-${p.id}`);
    try {
      const res = await fetch(`/api/admin/payments/${p.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Payment deleted');
      setDetailPayment(null);
      await load();
    } catch {
      toast.error('Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

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
    { view: 'admin-notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { view: 'admin-coupons', label: 'Coupons', icon: <Tag className="w-4 h-4" /> },
    { view: 'admin-settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      <aside className="hidden md:block w-60 bg-[#0F0F0F] border-r border-[#27272A] p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="mb-6 p-3 bg-gradient-to-br from-amber-500/10 to-red-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-white font-bold text-sm">ADMIN PANEL</div>
              <div className="text-xs text-zinc-400 truncate">{user.email}</div>
            </div>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                item.view === 'admin-payments'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
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

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-[#F5C518]" /> Payments Management
            </h1>
            <div className="text-xs text-zinc-500">EasyPaisa</div>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-[#141414] border-[#27272A] p-5">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div className="text-amber-400 text-sm font-semibold">Pending Review</div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.PENDING?.count ?? 0}</div>
              <div className="text-xs text-zinc-500 mt-1">{formatPKR(stats.PENDING?.total ?? 0)} awaiting</div>
            </Card>
            <Card className="bg-[#141414] border-[#27272A] p-5">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div className="text-emerald-400 text-sm font-semibold">Approved</div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.APPROVED?.count ?? 0}</div>
              <div className="text-xs text-zinc-500 mt-1">{formatPKR(stats.APPROVED?.total ?? 0)} total</div>
            </Card>
            <Card className="bg-[#141414] border-[#27272A] p-5">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <div className="text-red-400 text-sm font-semibold">Rejected</div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.REJECTED?.count ?? 0}</div>
              <div className="text-xs text-zinc-500 mt-1">{formatPKR(stats.REJECTED?.total ?? 0)} total</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-[#141414] border-[#27272A] p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Search by TID, user email, or name..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="bg-black border-[#27272A] text-white pl-10"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Filter className="w-4 h-4 text-zinc-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-black border border-[#27272A] text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="bg-black border border-[#27272A] text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="PACKAGE">Diamond Packages</option>
                  <option value="TOURNAMENT">Tournaments</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Payments table */}
          <Card className="bg-[#141414] border-[#27272A] overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-[#0F0F0F] animate-pulse rounded" />)}
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400">No payments found</p>
                <p className="text-xs text-zinc-600 mt-1">Try adjusting filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#27272A] text-zinc-400 text-xs uppercase">
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Type / Item</th>
                      <th className="text-left p-3">TID</th>
                      <th className="text-right p-3">Amount</th>
                      <th className="text-center p-3">Status</th>
                      <th className="text-center p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A]">
                        <td className="p-3 text-zinc-300 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString()}<br />
                          <span className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="p-3">
                          <div className="text-white">{p.user.name || '—'}</div>
                          <div className="text-xs text-zinc-500">{p.user.email}</div>
                        </td>
                        <td className="p-3">
                          {p.package ? (
                            <div>
                              <div className="text-white">{p.package.name}</div>
                              <div className="text-xs text-zinc-500">Diamond Package</div>
                            </div>
                          ) : p.tournament ? (
                            <div>
                              <div className="text-white">{p.tournament.title}</div>
                              <div className="text-xs text-zinc-500">{p.tournament.type} Tournament</div>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="p-3 font-mono text-xs text-amber-400">{p.transactionId}</td>
                        <td className="p-3 text-right text-white font-semibold">{formatPKR(p.amount)}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs border ${PAYMENT_STATUS_COLORS[p.status]}`}>
                            {PAYMENT_STATUS_LABELS[p.status]}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDetailPayment(p)}
                              className="text-zinc-300 hover:text-white hover:bg-white/5 h-8 w-8 p-0"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {p.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleApprove(p)}
                                  disabled={actionLoading === `approve-${p.id}`}
                                  className="text-emerald-400 hover:bg-emerald-500/10 h-8 w-8 p-0"
                                  title="Approve"
                                >
                                  {actionLoading === `approve-${p.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { setRejectPayment(p); setRejectReason(''); }}
                                  className="text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-[#27272A] text-sm">
                <div className="text-zinc-400">
                  Page {page} of {totalPages} • {total} total
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="border-[#27272A] text-zinc-300">
                    Previous
                  </Button>
                  <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="border-[#27272A] text-zinc-300">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F0F0F] border-t border-[#27272A] z-50 overflow-x-auto">
        <div className="flex gap-1 px-2 py-2 min-w-max">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 shrink-0 ${item.view === 'admin-payments' ? 'text-amber-400' : 'text-zinc-400'}`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Detail dialog */}
      <Dialog open={!!detailPayment} onOpenChange={(o) => !o && setDetailPayment(null)}>
        <DialogContent className="bg-[#141414] border-[#27272A] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#F5C518]" />
              Payment Details
            </DialogTitle>
          </DialogHeader>
          {detailPayment && (
            <div className="space-y-4">
              {/* Status banner */}
              <div className={`p-3 rounded-lg border text-center font-semibold ${PAYMENT_STATUS_COLORS[detailPayment.status]}`}>
                {PAYMENT_STATUS_LABELS[detailPayment.status]}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-500">User</div>
                  <div className="text-white">{detailPayment.user.name || '—'}</div>
                  <div className="text-xs text-zinc-400">{detailPayment.user.email}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">FF UID / Nickname</div>
                  <div className="text-white">{detailPayment.user.ffUid || '—'}</div>
                  <div className="text-xs text-zinc-400">{detailPayment.user.ffNickname || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Amount</div>
                  <div className="text-[#F5C518] font-bold text-lg">{formatPKR(detailPayment.amount)}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Payment Method</div>
                  <div className="text-white">{detailPayment.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Transaction ID</div>
                  <div className="text-amber-400 font-mono text-sm">{detailPayment.transactionId}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Submitted At</div>
                  <div className="text-white text-sm">{new Date(detailPayment.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Item */}
              {detailPayment.package && (
                <div className="p-3 bg-black/40 rounded-lg">
                  <div className="text-xs text-zinc-500 mb-1">Diamond Package</div>
                  <div className="text-white font-semibold">{detailPayment.package.name}</div>
                  <div className="text-xs text-zinc-400">
                    {detailPayment.package.diamonds ?? 0} diamonds
                    {detailPayment.package.bonusDiamonds > 0 && ` + ${detailPayment.package.bonusDiamonds} bonus`}
                    {' • '}{formatPKR(detailPayment.package.price)}
                  </div>
                </div>
              )}
              {detailPayment.tournament && (
                <div className="p-3 bg-black/40 rounded-lg">
                  <div className="text-xs text-zinc-500 mb-1">Tournament Registration</div>
                  <div className="text-white font-semibold">{detailPayment.tournament.title}</div>
                  <div className="text-xs text-zinc-400">
                    {detailPayment.tournament.type} • Starts {new Date(detailPayment.tournament.startDateTime).toLocaleString()}
                  </div>
                </div>
              )}

              {/* Admin remark */}
              {detailPayment.adminRemark && (
                <div className="p-3 bg-black/40 rounded-lg">
                  <div className="text-xs text-zinc-500 mb-1">Admin Remark</div>
                  <div className="text-zinc-300 text-sm">{detailPayment.adminRemark}</div>
                  {detailPayment.approvedAt && <div className="text-xs text-zinc-500 mt-1">Approved: {new Date(detailPayment.approvedAt).toLocaleString()}</div>}
                </div>
              )}

              {/* Screenshot */}
              <div>
                <div className="text-xs text-zinc-500 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Payment Screenshot
                </div>
                <div className="rounded-lg overflow-hidden border border-[#27272A] bg-black">
                  { }
                  <img
                    src={detailPayment.screenshot}
                    alt="Payment screenshot"
                    className="w-full max-h-[400px] object-contain"
                  />
                </div>
                <a
                  href={detailPayment.screenshot}
                  download={`payment-${detailPayment.transactionId}.jpg`}
                  className="inline-block mt-2 text-xs text-amber-400 hover:underline"
                >
                  Download screenshot
                </a>
              </div>

              {/* Actions */}
              {detailPayment.status === 'PENDING' && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    onClick={() => handleApprove(detailPayment)}
                    disabled={actionLoading === `approve-${detailPayment.id}`}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {actionLoading === `approve-${detailPayment.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve Payment
                  </Button>
                  <Button
                    onClick={() => { setRejectPayment(detailPayment); setRejectReason(''); }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              )}
              <Button
                onClick={() => handleDelete(detailPayment)}
                disabled={!!actionLoading}
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" /> Delete Record
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject reason dialog */}
      <Dialog open={!!rejectPayment} onOpenChange={(o) => !o && setRejectPayment(null)}>
        <DialogContent className="bg-[#141414] border-[#27272A] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" /> Reject Payment
            </DialogTitle>
          </DialogHeader>
          {rejectPayment && (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                Rejecting payment of <span className="text-white font-semibold">{formatPKR(rejectPayment.amount)}</span> for{' '}
                <span className="text-white">{rejectPayment.user.name || rejectPayment.user.email}</span>.
                The user will be notified with the reason.
              </p>
              <div className="space-y-2">
                <Label className="text-zinc-300">Rejection Reason *</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Transaction ID not found in EasyPaisa records. Please verify and re-submit."
                  className="bg-black border-[#27272A] text-white min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-zinc-500">{rejectReason.length}/500</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectPayment(null)} className="text-zinc-400">
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading === `reject-${rejectPayment?.id}`}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading === `reject-${rejectPayment?.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
