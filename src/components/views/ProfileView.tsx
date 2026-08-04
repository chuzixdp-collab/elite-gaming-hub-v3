'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/shared/GoldButton';
import { toast } from 'sonner';
import { User as UserIcon, Lock, Save, Loader2, ArrowLeft, Upload, KeyRound } from 'lucide-react';

export function ProfileView() {
  const navigate = useNavigation((s) => s.navigate);
  const back = useNavigation((s) => s.back);
  const { user, setUser, hydrate, hydrated } = useAuth();

  const [profile, setProfile] = useState({ name: '', ffUid: '', ffNickname: '', avatarUrl: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !user) navigate('login');
    if (user) {
      setProfile({
        name: user.name || '',
        ffUid: user.ffUid || '',
        ffNickname: user.ffNickname || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          ffUid: profile.ffUid || null,
          ffNickname: profile.ffNickname || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Update failed', { description: err instanceof Error ? err.message : 'Try again' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSavingPass(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Password changed successfully');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error('Password change failed', { description: err instanceof Error ? err.message : 'Try again' });
    } finally {
      setSavingPass(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error('Image too large (max 2MB)');
      return;
    }
    setUploadingAvatar(true);
    try {
      // Convert to base64 for storage (in production, use S3/Cloudinary)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: base64 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        setUser(data.user);
        setProfile((p) => ({ ...p, avatarUrl: base64 }));
        toast.success('Avatar updated');
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Avatar upload failed');
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={back} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">Profile & Settings</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Avatar & basic info */}
          <Card className="bg-[#141414] border-[#27272A] p-6 md:col-span-1 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F5C518] to-[#DC2626] flex items-center justify-center text-black font-bold text-3xl mx-auto overflow-hidden">
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (user.name?.charAt(0) || user.email.charAt(0))}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#F5C518] text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>
            <h3 className="text-white font-bold">{user.name || 'Player'}</h3>
            <p className="text-zinc-400 text-sm">{user.email}</p>
            <div className="mt-3 inline-block px-3 py-1 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-full">
              <span className="text-xs text-[#F5C518] font-semibold uppercase">{user.role}</span>
            </div>
          </Card>

          {/* Profile form */}
          <Card className="bg-[#141414] border-[#27272A] p-6 md:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><UserIcon className="w-5 h-5 text-[#F5C518]" /> Profile Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Display Name</Label>
                <Input id="name" required minLength={2} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ffUid" className="text-zinc-300">Free Fire UID</Label>
                  <Input id="ffUid" pattern="\d{8,12}" value={profile.ffUid} onChange={(e) => setProfile({ ...profile, ffUid: e.target.value.replace(/\D/g, '') })} className="bg-black border-[#27272A] text-white font-mono" placeholder="1234567890" maxLength={12} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ffNickname" className="text-zinc-300">FF Nickname</Label>
                  <Input id="ffNickname" value={profile.ffNickname} onChange={(e) => setProfile({ ...profile, ffNickname: e.target.value })} className="bg-black border-[#27272A] text-white" placeholder="ProGamer2026" />
                </div>
              </div>
              <GoldButton type="submit" disabled={savingProfile}>
                {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </GoldButton>
            </form>
          </Card>

          {/* Password change */}
          <Card className="bg-[#141414] border-[#27272A] p-6 md:col-span-3">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-[#F5C518]" /> Change Password</h2>
            <form onSubmit={handleChangePassword} className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPass" className="text-zinc-300">Current Password</Label>
                <Input id="currentPass" type="password" required value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPass" className="text-zinc-300">New Password</Label>
                <Input id="newPass" type="password" required minLength={8} value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPass" className="text-zinc-300">Confirm New Password</Label>
                <Input id="confirmPass" type="password" required value={passForm.confirmPassword} onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
              <div className="md:col-span-3">
                <GoldButton type="submit" disabled={savingPass}>
                  {savingPass ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><KeyRound className="w-4 h-4" /> Update Password</>}
                </GoldButton>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
