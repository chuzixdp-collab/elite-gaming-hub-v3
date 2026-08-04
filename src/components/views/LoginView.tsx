'use client';
import { useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GoldButton } from '@/components/shared/GoldButton';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock, Flame, ArrowLeft } from 'lucide-react';

export function LoginView() {
  const navigate = useNavigation((s) => s.navigate);
  const back = useNavigation((s) => s.back);
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name || data.user.email}!`);
      navigate(data.user.role === 'ADMIN' ? 'admin-dashboard' : 'dashboard');
    } catch (err) {
      toast.error('Login failed', { description: err instanceof Error ? err.message : 'Try again' });
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
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-zinc-400 text-sm mt-1">Login to your Elite Gaming Hub account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="bg-black border-[#27272A] text-white pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={form.remember} onCheckedChange={(v) => setForm({ ...form, remember: !!v })} className="border-[#F5C518]/50 data-[state=checked]:bg-[#F5C518] data-[state=checked]:text-black" />
                <Label htmlFor="remember" className="text-zinc-300 text-sm cursor-pointer">Remember me</Label>
              </div>
              <button type="button" onClick={() => navigate('forgot-password')} className="text-xs text-[#F5C518] hover:underline">
                Forgot password?
              </button>
            </div>

            <GoldButton type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : 'Login'}
            </GoldButton>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don&apos;t have an account?{' '}
            <button onClick={() => navigate('signup')} className="text-[#F5C518] font-semibold hover:underline">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
