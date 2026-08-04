'use client';
import { useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoldButton } from '@/components/shared/GoldButton';
import { toast } from 'sonner';
import { Mail, Loader2, Flame, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordView() {
  const navigate = useNavigation((s) => s.navigate);
  const back = useNavigation((s) => s.back);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSent(true);
      if (data.devToken) setDevToken(data.devToken);
      toast.success('Reset link sent', { description: 'Check your email for instructions.' });
    } catch (err) {
      toast.error('Failed', { description: err instanceof Error ? err.message : 'Try again' });
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
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F5C518] to-[#DC2626] flex items-center justify-center mb-3">
              <Flame className="w-7 h-7 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
            <p className="text-zinc-400 text-sm mt-1">We&apos;ll send you a reset link</p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <p className="text-white font-semibold">Check your email</p>
              <p className="text-zinc-400 text-sm">
                If an account with <span className="text-[#F5C518]">{email}</span> exists, a reset link has been sent.
              </p>
              {devToken && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-left">
                  <div className="text-xs text-amber-400 font-semibold mb-1">DEV MODE — Reset Token:</div>
                  <code className="text-xs text-amber-200 break-all">{devToken}</code>
                  <p className="text-[10px] text-amber-400/70 mt-2">Use this token to reset password (in production, this would be emailed).</p>
                </div>
              )}
              <GoldButton className="w-full" onClick={() => navigate('login')}>
                Back to Login
              </GoldButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black border-[#27272A] text-white pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <GoldButton type="submit" disabled={loading} className="w-full">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
              </GoldButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
