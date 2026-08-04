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
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import { Plus, Pencil, KeyRound, Trophy, Loader2, Users, DollarSign, Trash2 } from 'lucide-react';

interface Tournament {
  id: string;
  title: string;
  type: string;
  bannerUrl: string;
  description: string | null;
  startDateTime: string;
  entryFee: number;
  prizePool: number;
  totalSlots: number;
  registeredCount: number;
  roomId: string | null;
  roomPassword: string | null;
  status: string;
  isActive: boolean;
}

const TOURNAMENT_STATUSES = ['UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'LIVE', 'COMPLETED', 'CANCELLED'];

export function AdminTournamentsView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [open, setOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState<Tournament | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<Tournament | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    title: '', type: 'DAILY', bannerUrl: '', description: '',
    startDateTime: '', entryFee: 0, prizePool: 0, totalSlots: 50, status: 'REGISTRATION_OPEN',
  });
  const [roomForm, setRoomForm] = useState({ roomId: '', roomPassword: '' });

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) { navigate('login'); return; }
    if (user?.role === 'ADMIN') fetchTournaments();
  }, [hydrated, user, navigate]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '', type: 'DAILY', bannerUrl: '', description: '',
      startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      entryFee: 0, prizePool: 100, totalSlots: 50, status: 'REGISTRATION_OPEN',
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        type: form.type,
        bannerUrl: form.bannerUrl || `data:image/svg+xml;base64,${btoa(`<svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="400" fill="#0A0A0A"/><text x="600" y="200" font-family="Arial" font-size="64" font-weight="bold" fill="#F5C518" text-anchor="middle">${form.title}</text></svg>`)}`,
        description: form.description || null,
        startDateTime: new Date(form.startDateTime).toISOString(),
        entryFee: Number(form.entryFee),
        prizePool: Number(form.prizePool),
        totalSlots: Number(form.totalSlots),
      };
      const res = await fetch('/api/tournaments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Tournament created');
      setOpen(false);
      fetchTournaments();
    } catch (err) {
      toast.error('Failed', { description: err instanceof Error ? err.message : 'Try again' });
    } finally { setSaving(false); }
  };

  const updateStatus = async (t: Tournament, status: string) => {
    await fetch(`/api/tournaments/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    toast.success(`Status updated to ${status}`);
    fetchTournaments();
  };

  const publishRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomOpen) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tournaments/${roomOpen.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomForm.roomId, roomPassword: roomForm.roomPassword, status: 'LIVE' }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Room details published — players notified!');
      setRoomOpen(null);
      fetchTournaments();
    } catch (err) {
      toast.error('Failed');
    } finally { setSaving(false); }
  };

  const openRoom = (t: Tournament) => {
    setRoomOpen(t);
    setRoomForm({ roomId: t.roomId || '', roomPassword: t.roomPassword || '' });
  };

  const confirmDelete = (t: Tournament) => {
    setDeleteOpen(t);
  };

  const performDelete = async () => {
    if (!deleteOpen) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tournaments/${deleteOpen.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete tournament');
      toast.success('Tournament deleted permanently');
      setDeleteOpen(null);
      // Instantly remove from local state for snappy UI
      setTournaments((prev) => prev.filter((t) => t.id !== deleteOpen.id));
      // Re-fetch to ensure server sync
      fetchTournaments();
    } catch (err) {
      toast.error('Failed to delete', { description: err instanceof Error ? err.message : 'Try again' });
    } finally {
      setDeleting(false);
    }
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2"><Trophy className="w-7 h-7 text-[#F5C518]" /> Manage Tournaments</h1>
          <Button onClick={openCreate} className="bg-[#F5C518] text-black hover:bg-[#FFD700]"><Plus className="w-4 h-4" /> New Tournament</Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Card key={i} className="bg-[#141414] border-[#27272A] h-32 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => (
              <Card key={t.id} className="bg-[#141414] border-[#27272A] p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <img src={t.bannerUrl} alt={t.title} className="w-full md:w-32 h-24 md:h-20 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-white font-bold">{t.title}</h3>
                      <StatusBadge status={t.type} type="tournament" />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Rs. {t.prizePool.toLocaleString()} prize / Rs. {t.entryFee.toLocaleString()} entry</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {t.registeredCount}/{t.totalSlots}</span>
                      <span>{new Date(t.startDateTime).toLocaleString()}</span>
                      {t.roomId && <span className="text-emerald-400 flex items-center gap-1"><KeyRound className="w-3 h-3" /> Room: {t.roomId}</span>}
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2">
                    <Select value={t.status} onValueChange={(v) => updateStatus(t, v)}>
                      <SelectTrigger className="h-8 w-full md:w-40 bg-black border-[#27272A] text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border-[#27272A]">
                        {TOURNAMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openRoom(t)} className="bg-transparent border-[#F5C518]/50 text-[#F5C518] hover:bg-[#F5C518]/10 flex-1">
                        <KeyRound className="w-3.5 h-3.5" /> Room
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirmDelete(t)}
                        className="bg-transparent border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                        title="Permanently delete tournament"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create tournament dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#141414] border-[#27272A] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">Create Tournament</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Title *</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-black border-[#27272A] text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-black border-[#27272A] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#27272A]">
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Start Date/Time *</Label>
                <Input type="datetime-local" required value={form.startDateTime} onChange={(e) => setForm({ ...form, startDateTime: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Entry Fee (Rs.)</Label>
                <Input type="number" step="0.01" min={0} value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Prize Pool (Rs.)</Label>
                <Input type="number" step="0.01" min={0} value={form.prizePool} onChange={(e) => setForm({ ...form, prizePool: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Total Slots</Label>
                <Input type="number" min={2} value={form.totalSlots} onChange={(e) => setForm({ ...form, totalSlots: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-black border-[#27272A] text-white min-h-[60px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Banner URL (optional — auto-generated if empty)</Label>
              <Input value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} className="bg-black border-[#27272A] text-white" placeholder="https://..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-[#F5C518] text-black hover:bg-[#FFD700]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Publish room dialog */}
      <Dialog open={!!roomOpen} onOpenChange={(o) => !o && setRoomOpen(null)}>
        <DialogContent className="bg-[#141414] border-[#27272A] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2"><KeyRound className="w-5 h-5 text-[#F5C518]" /> Publish Room Details</DialogTitle>
          </DialogHeader>
          {roomOpen && (
            <form onSubmit={publishRoom} className="space-y-4">
              <p className="text-sm text-zinc-400">Publish room ID and password for &ldquo;{roomOpen.title}&rdquo;. All registered players will be notified instantly.</p>
              <div className="space-y-2">
                <Label className="text-zinc-300">Room ID *</Label>
                <Input required value={roomForm.roomId} onChange={(e) => setRoomForm({ ...roomForm, roomId: e.target.value })} className="bg-black border-[#27272A] text-white font-mono" placeholder="123-456-789" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Password *</Label>
                <Input required value={roomForm.roomPassword} onChange={(e) => setRoomForm({ ...roomForm, roomPassword: e.target.value })} className="bg-black border-[#27272A] text-white font-mono" placeholder="elite2026" />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setRoomOpen(null)} className="text-zinc-400">Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-[#F5C518] text-black hover:bg-[#FFD700]">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish & Notify'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete tournament confirmation dialog */}
      <Dialog open={!!deleteOpen} onOpenChange={(o) => !o && setDeleteOpen(null)}>
        <DialogContent className="bg-[#141414] border-[#27272A] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" /> Delete Tournament
            </DialogTitle>
          </DialogHeader>
          {deleteOpen && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Are you sure you want to permanently delete this tournament?</p>
                  <p className="text-zinc-400 text-xs">This action cannot be undone. All related data including registrations, rewards, and prize claims will be removed.</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-[#27272A]">
                <p className="text-zinc-400 text-xs mb-1">Tournament</p>
                <p className="text-white font-bold">{deleteOpen.title}</p>
                <div className="flex gap-3 mt-2 text-xs text-zinc-400">
                  <span>Prize: Rs. {deleteOpen.prizePool.toLocaleString()}</span>
                  <span>Entry: Rs. {deleteOpen.entryFee.toLocaleString()}</span>
                  <span>Slots: {deleteOpen.registeredCount}/{deleteOpen.totalSlots}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(null)} className="text-zinc-400">Cancel</Button>
            <Button
              type="button"
              onClick={performDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-1" /> Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
