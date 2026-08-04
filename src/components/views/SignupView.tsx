'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoldButton } from '@/components/shared/GoldButton';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Flame, ArrowLeft, Gift, CheckCircle2 } from 'lucide-react';

export function SignupView() {
  const navigate = useNavigation((s) => s.navigate);
  const back = useNavigation((s) => s.back);
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);

  // Prefill referral code from ?ref= URL param
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setForm((prev) => ({ ...prev, referralCode: ref.toUpperCase() }));
    }
  }, []);

  // Validate referral code on change (debounced)
  useEffect(() => {
    const code = form.referralCode.trim().toUpperCase();
    if (!code) {
      setReferrerName(null);
      setReferralValid(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/referral/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralCode: code }),
        });
        const data = await res.json();
        setReferralValid(data.valid === true);
        setReferrerName(data.referrerName || null);
      } catch {
        setReferralValid(false);
        setReferrerName(null);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [form.referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const payload: { name: string; email: string; password: string; referralCode?: string } = {
        name: form.name,
        email: form.email,
        password: form.password,
      };
      if (form.referralCode.trim()) {
        payload.referralCode = form.referralCode.trim().toUpperCase();
      }
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setUser(data.user);
      toast.success('Account created!', { description: 'Welcome to Elite Gaming Hub' });
      navigate('dashboard');
    } catch (err) {
      toast.error('Signup failed', { description: err instanceof Error ? err.message : 'Try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button onClick={back} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-[#141414] border border-[#27272A] rounded-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F5C518] to-[#DC2626] flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(245,197,24,0.3)]">
              <Flame className="w-7 h-7 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white">Join Elite Gaming Hub</h1>
            <p className="text-zinc-400 text-sm mt-1">Create your account in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="name"
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-black border-[#27272A] text-white pl-10"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-black border-[#27272A] text-white pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="bg-black border-[#27272A] text-white pl-10 pr-10"
                  placeholder="Min 8 characters"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="confirmPassword"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="bg-black border-[#27272A] text-white pl-10"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-zinc-300 flex items-center gap-2">
                <Gift className="w-3 h-3 text-[#F5C518]" />
                Referral Code (optional)
              </Label>
              <Input
                id="referralCode"
                value={form.referralCode}
                onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
                className="bg-black border-[#27272A] text-white font-mono uppercase"
                placeholder="e.g. ELITE1234"
              />
              {referralValid === true && referrerName && (
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Valid referral — referred by {referrerName}
                </div>
              )}
              {referralValid === false && form.referralCode.trim() && (
                <div className="text-xs text-red-400">Invalid referral code</div>
              )}
              {referralValid === true && (
                <div className="text-xs text-[#F5C518]">
                  Your referrer earns Rs.5 when you complete your first purchase or tournament registration!
                </div>
              )}
            </div>

            <GoldButton type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </GoldButton>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="text-[#F5C518] font-semibold hover:underline">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
