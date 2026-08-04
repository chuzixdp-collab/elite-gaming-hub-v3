'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trophy, Loader2, Crown, Medal, Send } from 'lucide-react';

interface Tournament { id: string; title: string; type: string; prizePool: number; rewards: Array<{ position: number; prizeAmount: number }>; registrations: Array<{ userId: string; ffNickname: string }> }
interface UserBrief { id: string; name: string | null; email: string }

export function AdminResultsView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [users, setUsers] = useState<UserBrief[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [results, setResults] = useState<Array<{ userId: string; position: number; prizeAmount: number }>>([
    { userId: '', position: 1, prizeAmount: 0 },
    { userId: '', position: 2, prizeAmount: 0 },
    { userId: '', position: 3, prizeAmount: 0 },
  ]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) { navigate('login'); return; }
    if (user?.role === 'ADMIN') {
      fetch('/api/tournaments').then(r => r.json()).then(d => setTournaments(d.tournaments || [])).catch(() => {});
      fetch('/api/admin/users?pageSize=100').then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
    }
  }, [hydrated, user, navigate]);

  useEffect(() => {
    if (selectedTournament) {
      const t = tournaments.find((x) => x.id === selectedTournament);
      if (t) {
        setResults([
          { userId: '', position: 1, prizeAmount: t.rewards.find(r => r.position === 1)?.prizeAmount || t.prizePool * 0.5 },
          { userId: '', position: 2, prizeAmount: t.rewards.find(r => r.position === 2)?.prizeAmount || t.prizePool * 0.3 },
          { userId: '', position: 3, prizeAmount: t.rewards.find(r => r.position === 3)?.prizeAmount || t.prizePool * 0.2 },
        ]);
      }
    }
  }, [selectedTournament, tournaments]);

  const publish = async () => {
    if (!selectedTournament) { toast.error('Select a tournament'); return; }
    const valid = results.filter(r => r.userId);
    if (valid.length === 0) { toast.error('Select at least one winner'); return; }
    setPublishing(true);
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: selectedTournament, results: valid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(`Results published! ${data.announced} winners notified.`);
      setSelectedTournament('');
    } catch (err) {
      toast.error('Publish failed', { description: err instanceof Error ? err.message : 'Try again' });
    } finally { setPublishing(false); }
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2"><Trophy className="w-7 h-7 text-[#F5C518]" /> Publish Tournament Results</h1>

        <Card className="bg-[#141414] border-[#27272A] p-6 mb-6">
          <div className="space-y-2 mb-4">
            <Label className="text-zinc-300">Select Tournament *</Label>
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="bg-black border-[#27272A] text-white"><SelectValue placeholder="Choose a tournament..." /></SelectTrigger>
              <SelectContent className="bg-[#141414] border-[#27272A]">
                {tournaments.map((t) => <SelectItem key={t.id} value={t.id}>{t.title} ({t.type})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {selectedTournament && (
          <Card className="bg-[#141414] border-[#27272A] p-6">
            <h3 className="text-white font-bold mb-4">Top 3 Winners</h3>
            <div className="space-y-4">
              {results.map((r, idx) => {
                const icons = [<Crown key="1" className="w-5 h-5 text-[#F5C518]" />, <Medal key="2" className="w-5 h-5 text-zinc-300" />, <Medal key="3" className="w-5 h-5 text-amber-700" />];
                return (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-black/40 border border-[#27272A] flex items-center justify-center shrink-0">
                      {icons[idx]}
                    </div>
                    <div className="flex-1">
                      <Select value={r.userId} onValueChange={(v) => {
                        const next = [...results];
                        next[idx] = { ...r, userId: v };
                        setResults(next);
                      }}>
                        <SelectTrigger className="bg-black border-[#27272A] text-white">
                          <SelectValue placeholder={`Select ${idx + 1}${idx === 0 ? 'st' : idx === 1 ? 'nd' : 'rd'} place winner...`} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141414] border-[#27272A] max-h-72">
                          {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-28">
                      <Input type="number" step="0.01" value={r.prizeAmount} onChange={(e) => {
                        const next = [...results];
                        next[idx] = { ...r, prizeAmount: Number(e.target.value) };
                        setResults(next);
                      }} className="bg-black border-[#27272A] text-white text-right" />
                    </div>
                  </div>
                );
              })}
            </div>
            <Button onClick={publish} disabled={publishing} className="w-full mt-6 bg-[#F5C518] text-black hover:bg-[#FFD700]">
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Publish Results & Notify Winners</>}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
