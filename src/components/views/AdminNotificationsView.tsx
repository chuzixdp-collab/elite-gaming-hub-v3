'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Send, Bell, Loader2, Users } from 'lucide-react';

interface UserBrief { id: string; name: string | null; email: string }
interface Notification { id: string; type: string; title: string; message: string; isGlobal: boolean; createdAt: string; user: { name: string | null; email: string } | null }

const NOTIF_TYPES = ['GENERAL', 'ORDER_CONFIRMED', 'ORDER_COMPLETED', 'TOURNAMENT_REGISTERED', 'TOURNAMENT_STARTING', 'WINNER_ANNOUNCEMENT', 'ROOM_PUBLISHED'];

export function AdminNotificationsView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [users, setUsers] = useState<UserBrief[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [form, setForm] = useState({ type: 'GENERAL', title: '', message: '', userId: '' });
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) { navigate('login'); return; }
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/users?pageSize=200').then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
      fetchList();
    }
  }, [hydrated, user, navigate]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      setNotifs(data.notifications || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          title: form.title,
          message: form.message,
          userId: form.userId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(form.userId ? 'Notification sent' : `Broadcast sent to ${data.sent} users`);
      setForm({ type: 'GENERAL', title: '', message: '', userId: '' });
      fetchList();
    } catch (err) {
      toast.error('Failed', { description: err instanceof Error ? err.message : 'Try again' });
    } finally { setSending(false); }
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2"><Bell className="w-7 h-7 text-[#F5C518]" /> Notifications</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#141414] border-[#27272A] p-6">
            <h2 className="text-lg font-bold text-white mb-4">Send Notification</h2>
            <form onSubmit={send} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-black border-[#27272A] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#27272A]">
                    {NOTIF_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Recipient</Label>
                <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v === 'GLOBAL' ? '' : v })}>
                  <SelectTrigger className="bg-black border-[#27272A] text-white"><SelectValue placeholder="Global — all users" /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#27272A] max-h-72">
                    <SelectItem value="GLOBAL">🌐 Global — All Users</SelectItem>
                    {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Title *</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Message *</Label>
                <Textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-black border-[#27272A] text-white min-h-[100px]" />
              </div>
              <Button type="submit" disabled={sending} className="w-full bg-[#F5C518] text-black hover:bg-[#FFD700]">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Notification</>}
              </Button>
            </form>
          </Card>

          <Card className="bg-[#141414] border-[#27272A] p-6">
            <h2 className="text-lg font-bold text-white mb-4">Recent Notifications</h2>
            {loading ? (
              <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 bg-[#0F0F0F]" />)}</div>
            ) : notifs.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">No notifications sent yet.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifs.slice(0, 20).map((n) => (
                  <div key={n.id} className="p-3 bg-black/40 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-[#F5C518]/10 text-[#F5C518] rounded font-semibold uppercase">{n.type.replace(/_/g, ' ')}</span>
                      {n.isGlobal && <span className="text-xs flex items-center gap-1 text-emerald-400"><Users className="w-3 h-3" /> Global</span>}
                    </div>
                    <div className="text-white text-sm font-semibold">{n.title}</div>
                    <div className="text-zinc-400 text-xs line-clamp-2 mt-0.5">{n.message}</div>
                    <div className="text-zinc-600 text-xs mt-1">
                      {n.user ? `To: ${n.user.name || n.user.email}` : 'Global'} • {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
