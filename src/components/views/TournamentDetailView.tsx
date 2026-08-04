'use client';
import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { GoldButton } from '@/components/shared/GoldButton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft, Trophy, Users, Calendar, MapPin, Key, Loader2, CheckCircle2,
  Crown, Medal, Smartphone, Copy, Upload, Image as ImageIcon, X,
} from 'lucide-react';
import { formatPKR, REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_COLORS } from '@/lib/constants';

interface Tournament {
  id: string;
  title: string;
  type: string;
  bannerUrl: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string | null;
  entryFee: number;
  prizePool: number;
  totalSlots: number;
  registeredCount: number;
  roomId: string | null;
  roomPassword: string | null;
  status: string;
  rewards: Array<{ id: string; position: number; prizeAmount: number; prizeDescription: string | null }>;
  registrations: Array<{ id: string; userId: string; ffNickname: string; isSolo: boolean; teamName: string | null; status: string }>;
}

interface EasyPaisaSettings {
  easypaisaNumber: string;
  easypaisaAccountName: string;
  paymentInstructions: string;
}

interface UserReg {
  status: string;
}

export function TournamentDetailView() {
  const { params, navigate, back } = useNavigation();
  const tournamentId = params.id as string;
  const { user, hydrate, hydrated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({
    ffUid: user?.ffUid || '',
    ffNickname: user?.ffNickname || '',
    isSolo: 'solo',
    teamName: '',
  });
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [settings, setSettings] = useState<EasyPaisaSettings | null>(null);
  const [userReg, setUserReg] = useState<UserReg | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    fetch('/api/settings/payment')
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(() => setSettings({ easypaisaNumber: '0312-4376721', easypaisaAccountName: 'Elite Gaming Hub', paymentInstructions: '' }));
  }, []);

  useEffect(() => {
    if (!tournamentId) {
      navigate('tournaments');
      return;
    }
    fetch(`/api/tournaments/${tournamentId}`)
      .then((r) => r.json())
      .then((d) => {
        setTournament(d.tournament);
        if (user && d.tournament) {
          const reg = d.tournament.registrations.find((r: { userId: string; status: string }) => r.userId === user.id);
          setUserReg(reg ? { status: reg.status } : null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tournamentId, navigate, user]);

  const openRegister = () => {
    if (!user) {
      toast.error('Please log in to register');
      navigate('login');
      return;
    }
    setRegisterOpen(true);
  };

  const copyEasyPaisa = () => {
    if (!settings) return;
    navigator.clipboard.writeText(settings.easypaisaNumber);
    toast.success('EasyPaisa number copied!');
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be smaller than 5 MB');
      return;
    }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setScreenshotFile(null);
    setScreenshotPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{8,12}$/.test(regForm.ffUid)) {
      toast.error('FF UID must be 8-12 digits');
      return;
    }
    if (!regForm.ffNickname || regForm.ffNickname.length < 2) {
      toast.error('Nickname is required');
      return;
    }
    if (regForm.isSolo === 'team' && !regForm.teamName) {
      toast.error('Team name is required');
      return;
    }

    // If paid tournament → require EasyPaisa payment proof
    if (tournament && tournament.entryFee > 0) {
      if (!transactionId || transactionId.trim().length < 4) {
        toast.error('Please enter your EasyPaisa Transaction ID');
        return;
      }
      if (!screenshotFile) {
        toast.error('Please upload your payment screenshot');
        return;
      }
    }

    setRegistering(true);
    try {
      if (tournament && tournament.entryFee > 0) {
        // Paid tournament → submit via /api/payments/submit (multipart)
        const formData = new FormData();
        formData.append('tournamentId', tournament.id);
        formData.append('transactionId', transactionId.trim());
        formData.append('paymentMethod', 'EASYPAISA');
        formData.append('ffUid', regForm.ffUid);
        formData.append('ffNickname', regForm.ffNickname);
        formData.append('isSolo', String(regForm.isSolo === 'solo'));
        if (regForm.isSolo === 'team' && regForm.teamName) {
          formData.append('teamName', regForm.teamName);
        }
        formData.append('screenshot', screenshotFile as File);

        const res = await fetch('/api/payments/submit', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        toast.success('Registration submitted!', {
          description: 'Payment pending admin review. You will be notified once approved.',
        });
      } else {
        // Free tournament → direct registration via /api/tournaments/[id]/register
        const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ffUid: regForm.ffUid,
            ffNickname: regForm.ffNickname,
            isSolo: regForm.isSolo === 'solo',
            teamName: regForm.isSolo === 'team' ? regForm.teamName : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        toast.success('Registered successfully!', { description: 'Check notifications for details.' });
      }

      setUserReg({ status: tournament && tournament.entryFee > 0 ? 'PENDING_APPROVAL' : 'APPROVED' });
      setRegisterOpen(false);
      setTransactionId('');
      clearFile();
      // Refresh tournament
      const fresh = await fetch(`/api/tournaments/${tournamentId}`).then((r) => r.json());
      if (fresh.tournament) setTournament(fresh.tournament);
    } catch (err) {
      toast.error('Registration failed', { description: err instanceof Error ? err.message : 'Try again' });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F5C518] animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <p className="text-white text-lg mb-4">Tournament not found.</p>
        <GoldButton onClick={() => navigate('tournaments')}>Browse Tournaments</GoldButton>
      </div>
    );
  }

  const remaining = Math.max(0, tournament.totalSlots - tournament.registeredCount);
  const fillPercent = (tournament.registeredCount / tournament.totalSlots) * 100;
  const isPaid = tournament.entryFee > 0;

  return (
    <div className="min-h-screen bg-black pb-16">
      {/* Banner */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        { }
        <img src={tournament.bannerUrl} alt={tournament.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <button onClick={back} className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-2 rounded-lg text-white hover:bg-black/80 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto px-4">
            <div className="mb-3"><StatusBadge status={tournament.type} type="tournament" /></div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{tournament.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-[#F5C518]" /> {new Date(tournament.startDateTime).toLocaleString()}</span>
              <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-[#F5C518]" /> {tournament.entryFee === 0 ? 'Free Entry' : `${formatPKR(tournament.entryFee)} Entry`}</span>
              <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-[#F5C518]" /> {formatPKR(tournament.prizePool)} Prize Pool</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card className="bg-[#141414] border-[#27272A] p-6">
            <h2 className="text-xl font-bold text-white mb-3">About this Tournament</h2>
            <p className="text-zinc-300 leading-relaxed">{tournament.description || 'No description provided.'}</p>
          </Card>

          {/* Countdown */}
          <Card className="bg-[#141414] border-[#27272A] p-6">
            <h2 className="text-xl font-bold text-white mb-4">Starts In</h2>
            <CountdownTimer targetDate={tournament.startDateTime} />
          </Card>

          {/* Rewards */}
          <Card className="bg-[#141414] border-[#27272A] p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F5C518]" /> Prize Distribution
            </h2>
            <div className="space-y-3">
              {tournament.rewards.map((r) => {
                const icons = [
                  <Crown key="1" className="w-7 h-7 text-[#F5C518]" />,
                  <Medal key="2" className="w-7 h-7 text-zinc-300" />,
                  <Medal key="3" className="w-7 h-7 text-amber-700" />,
                ];
                return (
                  <div key={r.id} className="flex items-center gap-4 p-3 bg-black/40 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5C518]/30 to-[#DC2626]/20 border border-[#F5C518]/30 flex items-center justify-center">
                      {icons[r.position - 1] || <Medal className="w-6 h-6 text-zinc-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{r.position === 1 ? '1st Place' : r.position === 2 ? '2nd Place' : r.position === 3 ? '3rd Place' : `Position ${r.position}`}</div>
                      <div className="text-xs text-zinc-400">{r.prizeDescription || ''}</div>
                    </div>
                    <div className="text-[#F5C518] font-bold text-lg">{formatPKR(r.prizeAmount)}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Room info if published */}
          {tournament.roomId && (
            <Card className="bg-emerald-500/5 border-emerald-500/30 p-6">
              <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" /> Room Details Published
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/60 rounded-lg">
                  <div className="text-xs text-zinc-400 mb-1">Room ID</div>
                  <div className="text-white font-mono font-bold text-lg">{tournament.roomId}</div>
                </div>
                {tournament.roomPassword && (
                  <div className="p-4 bg-black/60 rounded-lg">
                    <div className="text-xs text-zinc-400 mb-1">Password</div>
                    <div className="text-white font-mono font-bold text-lg">{tournament.roomPassword}</div>
                  </div>
                )}
              </div>
              <p className="text-xs text-amber-400 mt-3">Join the room 10 minutes before the tournament starts.</p>
            </Card>
          )}
        </div>

        {/* Right column — registration panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-[#141414] border-[#27272A] p-6 sticky top-24">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-black/40 rounded-lg">
                  <Users className="w-5 h-5 text-[#F5C518] mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{tournament.registeredCount}/{tournament.totalSlots}</div>
                  <div className="text-xs text-zinc-400">Registered</div>
                </div>
                <div className="text-center p-3 bg-black/40 rounded-lg">
                  <Trophy className="w-5 h-5 text-[#F5C518] mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{formatPKR(tournament.prizePool)}</div>
                  <div className="text-xs text-zinc-400">Prize Pool</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Slots filled</span>
                  <span>{Math.round(fillPercent)}%</span>
                </div>
                <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#F5C518] to-[#FFD700]" style={{ width: `${fillPercent}%` }} />
                </div>
                <div className="text-xs text-zinc-500 mt-1">{remaining} slots remaining</div>
              </div>

              <div className="pt-4 border-t border-[#27272A]">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Entry Fee</span>
                  <span className="text-white font-bold">{tournament.entryFee === 0 ? 'FREE' : formatPKR(tournament.entryFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Format</span>
                  <span className="text-white">Solo & Squad</span>
                </div>
              </div>

              {userReg ? (
                <div className={`rounded-lg p-4 text-center border ${REGISTRATION_STATUS_COLORS[userReg.status] || 'border-[#27272A] bg-black/40'}`}>
                  {userReg.status === 'APPROVED' && <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />}
                  {userReg.status === 'PENDING_APPROVAL' && <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />}
                  <div className="font-semibold">{REGISTRATION_STATUS_LABELS[userReg.status] || userReg.status}</div>
                  {userReg.status === 'PENDING_APPROVAL' && (
                    <p className="text-xs text-zinc-400 mt-1">Admin is reviewing your payment. You will be notified.</p>
                  )}
                  {userReg.status === 'APPROVED' && (
                    <p className="text-xs text-zinc-400 mt-1">You&apos;re registered! Check notifications for updates.</p>
                  )}
                  {userReg.status === 'REJECTED' && (
                    <p className="text-xs text-zinc-400 mt-1">Your payment was rejected. Please re-register with valid payment.</p>
                  )}
                </div>
              ) : (
                <GoldButton onClick={openRegister} className="w-full" size="lg" disabled={remaining === 0}>
                  {remaining === 0 ? 'Tournament Full' : (isPaid ? `Register — ${formatPKR(tournament.entryFee)}` : 'Register Now — FREE')}
                </GoldButton>
              )}
            </div>
          </Card>

          {tournament.registrations.length > 0 && (
            <Card className="bg-[#141414] border-[#27272A] p-6">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-[#F5C518]" /> Recent Registrations</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tournament.registrations
                  .filter((r) => r.status === 'APPROVED' || r.status === 'CHECKED_IN')
                  .slice(0, 15)
                  .map((r) => (
                  <div key={r.id} className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5C518] to-[#DC2626] flex items-center justify-center text-black font-bold text-xs">
                      {r.ffNickname.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate">{r.ffNickname}</div>
                      <div className="text-xs text-zinc-500">{r.isSolo ? 'Solo' : `Team: ${r.teamName || 'N/A'}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-[#141414] border-[#27272A] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Register for {tournament.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-ffUid" className="text-zinc-300">Free Fire UID *</Label>
              <Input
                id="reg-ffUid"
                required
                pattern="\d{8,12}"
                value={regForm.ffUid}
                onChange={(e) => setRegForm({ ...regForm, ffUid: e.target.value.replace(/\D/g, '') })}
                className="bg-black border-[#27272A] text-white"
                placeholder="1234567890"
                maxLength={12}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-ffNickname" className="text-zinc-300">In-Game Nickname *</Label>
              <Input
                id="reg-ffNickname"
                required
                minLength={2}
                value={regForm.ffNickname}
                onChange={(e) => setRegForm({ ...regForm, ffNickname: e.target.value })}
                className="bg-black border-[#27272A] text-white"
                placeholder="ProGamer2026"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Participation Type *</Label>
              <RadioGroup value={regForm.isSolo} onValueChange={(v) => setRegForm({ ...regForm, isSolo: v })}>
                <div className="flex items-center gap-2 p-3 bg-black/40 rounded-lg border border-[#27272A]">
                  <RadioGroupItem value="solo" id="solo" className="border-[#F5C518] text-[#F5C518]" />
                  <Label htmlFor="solo" className="text-white cursor-pointer flex-1">Solo</Label>
                </div>
                <div className="flex items-center gap-2 p-3 bg-black/40 rounded-lg border border-[#27272A]">
                  <RadioGroupItem value="team" id="team" className="border-[#F5C518] text-[#F5C518]" />
                  <Label htmlFor="team" className="text-white cursor-pointer flex-1">Team / Squad</Label>
                </div>
              </RadioGroup>
            </div>
            {regForm.isSolo === 'team' && (
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-zinc-300">Team Name *</Label>
                <Input
                  id="teamName"
                  required
                  value={regForm.teamName}
                  onChange={(e) => setRegForm({ ...regForm, teamName: e.target.value })}
                  className="bg-black border-[#27272A] text-white"
                  placeholder="Elite Squad"
                />
              </div>
            )}

            {/* EasyPaisa payment section for paid tournaments */}
            {isPaid && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-[#F5C518]/10 to-[#DC2626]/5 border border-[#F5C518]/30 rounded-lg">
                <div className="flex items-center gap-2 text-[#F5C518] font-semibold text-sm">
                  <Smartphone className="w-4 h-4" /> EasyPaisa Payment Required
                </div>
                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                  <div>
                    <div className="text-xs text-zinc-400">EasyPaisa Number</div>
                    <div className="text-white font-bold">{settings?.easypaisaNumber || '0312-4376721'}</div>
                    <div className="text-xs text-zinc-400">Account: {settings?.easypaisaAccountName || 'Elite Gaming Hub'}</div>
                  </div>
                  <button type="button" onClick={copyEasyPaisa} className="p-2 bg-black/40 hover:bg-black/60 rounded-lg text-[#F5C518]">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-[#F5C518] font-semibold">
                  Send exactly: {formatPKR(tournament.entryFee)}
                </div>
                {settings?.paymentInstructions && (
                  <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">{settings.paymentInstructions}</pre>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reg-tid" className="text-zinc-300">Transaction ID *</Label>
                  <Input
                    id="reg-tid"
                    required={isPaid}
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    className="bg-black border-[#27272A] text-white font-mono"
                    placeholder="e.g. 12345678901"
                    maxLength={60}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Payment Screenshot * <span className="text-zinc-500">(max 5MB)</span></Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onFileChange}
                    className="hidden"
                    id="reg-screenshot-upload"
                  />
                  {!screenshotPreview ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-4 border-2 border-dashed border-[#27272A] hover:border-[#F5C518]/50 rounded-lg transition-colors flex flex-col items-center gap-1 text-zinc-400 hover:text-[#F5C518]"
                    >
                      <Upload className="w-6 h-6" />
                      <div className="text-xs font-semibold">Upload screenshot</div>
                    </button>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-[#27272A] bg-black">
                      { }
                      <img src={screenshotPreview} alt="Screenshot preview" className="w-full max-h-48 object-contain" />
                      <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-1 right-1 bg-black/80 hover:bg-black text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {screenshotFile?.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRegisterOpen(false)} className="text-zinc-400">Cancel</Button>
              <GoldButton type="submit" disabled={registering}>
                {registering ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : (isPaid ? `Submit & Pay ${formatPKR(tournament.entryFee)}` : 'Confirm Registration')}
              </GoldButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
