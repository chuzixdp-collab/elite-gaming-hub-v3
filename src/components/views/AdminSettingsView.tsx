'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, Loader2, Smartphone, CreditCard } from 'lucide-react';
import { DEFAULT_EASYPAISA_NUMBER, DEFAULT_EASYPAISA_ACCOUNT_NAME, DEFAULT_PAYMENT_INSTRUCTIONS } from '@/lib/constants';

export function AdminSettingsView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) { navigate('login'); return; }
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/settings').then(r => r.json()).then(d => setSettings(d.settings || {})).catch(() => {}).finally(() => setLoading(false));
    }
  }, [hydrated, user, navigate]);

  const saveGeneral = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error('Failed');
      toast.success('Settings saved');
    } catch {
      toast.error('Save failed');
    } finally { setSaving(false); }
  };

  const savePayment = async () => {
    setSavingPayment(true);
    try {
      const paymentSettings = {
        easypaisaNumber: settings.easypaisaNumber || DEFAULT_EASYPAISA_NUMBER,
        easypaisaAccountName: settings.easypaisaAccountName || DEFAULT_EASYPAISA_ACCOUNT_NAME,
        paymentInstructions: settings.paymentInstructions || DEFAULT_PAYMENT_INSTRUCTIONS,
      };
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(paymentSettings) });
      if (!res.ok) throw new Error('Failed');
      toast.success('EasyPaisa payment settings saved', {
        description: 'The new EasyPaisa number will appear everywhere on the site.',
      });
    } catch {
      toast.error('Save failed');
    } finally { setSavingPayment(false); }
  };

  if (!hydrated || !user) return null;

  const generalFields = [
    { key: 'siteName', label: 'Site Name', placeholder: 'Elite Gaming Hub' },
    { key: 'contactEmail', label: 'Contact Email', placeholder: 'support@elitegaming.com' },
    { key: 'discordUrl', label: 'Discord URL', placeholder: 'https://discord.gg/...' },
    { key: 'twitterUrl', label: 'Twitter URL', placeholder: 'https://twitter.com/...' },
    { key: 'youtubeUrl', label: 'YouTube URL', placeholder: 'https://youtube.com/@...' },
    { key: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
    { key: 'totalPlayers', label: 'Landing Page — Total Players', placeholder: '12547' },
    { key: 'totalTournaments', label: 'Landing Page — Tournaments Hosted', placeholder: '1289' },
    { key: 'diamondsDelivered', label: 'Landing Page — Diamonds Delivered', placeholder: '5200000' },
    { key: 'totalPrizePool', label: 'Landing Page — Total Prize Pool (Rs.)', placeholder: '4890000' },
  ];

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2"><SettingsIcon className="w-7 h-7 text-[#F5C518]" /> Site Settings</h1>

        {/* Payment Settings — EasyPaisa */}
        <Card className="bg-[#141414] border-[#F5C518]/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-[#F5C518]" />
            <h2 className="text-lg font-bold text-white">EasyPaisa Payment Settings</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Configure the EasyPaisa number shown to users during checkout, tournament registration, and in the footer.
            Changes apply instantly across the site.
          </p>
          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[#0F0F0F] animate-pulse rounded" />)}</div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">EasyPaisa Number *</Label>
                  <Input
                    value={settings.easypaisaNumber || ''}
                    placeholder={DEFAULT_EASYPAISA_NUMBER}
                    onChange={(e) => setSettings({ ...settings, easypaisaNumber: e.target.value })}
                    className="bg-black border-[#27272A] text-white font-mono"
                  />
                  <p className="text-xs text-zinc-500">Format: 03XX-XXXXXXX</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Account Name *</Label>
                  <Input
                    value={settings.easypaisaAccountName || ''}
                    placeholder={DEFAULT_EASYPAISA_ACCOUNT_NAME}
                    onChange={(e) => setSettings({ ...settings, easypaisaAccountName: e.target.value })}
                    className="bg-black border-[#27272A] text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Payment Instructions</Label>
                <Textarea
                  value={settings.paymentInstructions || ''}
                  placeholder={DEFAULT_PAYMENT_INSTRUCTIONS}
                  onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })}
                  className="bg-black border-[#27272A] text-white min-h-[140px] font-mono text-sm"
                />
                <p className="text-xs text-zinc-500">Step-by-step instructions shown to users on checkout & tournament registration pages.</p>
              </div>
              <Button onClick={savePayment} disabled={savingPayment} className="w-full bg-[#F5C518] text-black hover:bg-[#FFD700]">
                {savingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Payment Settings</>}
              </Button>
            </div>
          )}
        </Card>

        {/* General Settings */}
        <Card className="bg-[#141414] border-[#27272A] p-6">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-[#F5C518]" />
            <h2 className="text-lg font-bold text-white">General Settings</h2>
          </div>
          {loading ? (
            <div className="space-y-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-[#0F0F0F] animate-pulse rounded" />)}</div>
          ) : (
            <div className="space-y-4">
              {generalFields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label className="text-zinc-300">{f.label}</Label>
                  <Input
                    value={settings[f.key] || ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                    className="bg-black border-[#27272A] text-white"
                  />
                </div>
              ))}
              <Button onClick={saveGeneral} disabled={saving} className="w-full bg-[#F5C518] text-black hover:bg-[#FFD700]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save General Settings</>}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
