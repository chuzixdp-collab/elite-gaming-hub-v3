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
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, Loader2 } from 'lucide-react';
import { formatPKR } from '@/lib/constants';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  diamonds: number | null;
  bonusDiamonds: number;
  price: number;
  originalPrice: number | null;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

const emptyProduct = {
  name: '', description: '', category: 'DIAMONDS', diamonds: 0, bonusDiamonds: 0, price: 0, originalPrice: 0, imageUrl: '', sortOrder: 0,
};

export function AdminProductsView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) { navigate('login'); return; }
    if (user?.role === 'ADMIN') fetchProducts();
  }, [hydrated, user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProduct);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || '', category: p.category,
      diamonds: p.diamonds || 0, bonusDiamonds: p.bonusDiamonds || 0, price: p.price, originalPrice: p.originalPrice || 0,
      imageUrl: p.imageUrl, sortOrder: p.sortOrder,
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        category: form.category,
        diamonds: form.category === 'DIAMONDS' ? Number(form.diamonds) : null,
        bonusDiamonds: form.category === 'DIAMONDS' ? Number(form.bonusDiamonds) : 0,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) > 0 ? Number(form.originalPrice) : null,
        imageUrl: form.imageUrl,
        sortOrder: Number(form.sortOrder),
      };
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(editing ? 'Product updated' : 'Product created');
      setOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Save failed', { description: err instanceof Error ? err.message : 'Try again' });
    } finally { setSaving(false); }
  };

  const toggleActive = async (p: Product) => {
    await fetch(`/api/admin/products/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !p.isActive }) });
    fetchProducts();
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    toast.success('Product removed');
    fetchProducts();
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2"><Package className="w-7 h-7 text-[#F5C518]" /> Manage Products</h1>
          <Button onClick={openCreate} className="bg-[#F5C518] text-black hover:bg-[#FFD700]"><Plus className="w-4 h-4" /> Add Product</Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Card key={i} className="bg-[#141414] border-[#27272A] h-48 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <Card key={p.id} className="bg-[#141414] border-[#27272A] p-4">
                <div className="flex gap-3 mb-3">
                  <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-contain bg-black" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-zinc-500">{p.category}</div>
                    <div className="text-[#F5C518] font-bold mt-0.5">{formatPKR(p.price)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={p.isActive} onCheckedChange={() => toggleActive(p)} />
                    <span className="text-xs text-zinc-400">{p.isActive ? 'Active' : 'Hidden'}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)} className="h-8 w-8 text-amber-400 hover:bg-amber-500/10"><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(p)} className="h-8 w-8 text-red-400 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#141414] border-[#27272A] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Name *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-black border-[#27272A] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-black border-[#27272A] text-white min-h-[60px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-black border-[#27272A] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#27272A]">
                    <SelectItem value="DIAMONDS">Diamonds</SelectItem>
                    <SelectItem value="WEEKLY_MEMBERSHIP">Weekly Membership</SelectItem>
                    <SelectItem value="MONTHLY_MEMBERSHIP">Monthly Membership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.category === 'DIAMONDS' && (
                <div className="space-y-2">
                  <Label className="text-zinc-300">Diamonds Count</Label>
                  <Input type="number" min={0} value={form.diamonds} onChange={(e) => setForm({ ...form, diamonds: e.target.value })} className="bg-black border-[#27272A] text-white" />
                </div>
              )}
            </div>
            {form.category === 'DIAMONDS' && (
              <div className="space-y-2">
                <Label className="text-zinc-300">Bonus Diamonds</Label>
                <Input type="number" min={0} value={form.bonusDiamonds} onChange={(e) => setForm({ ...form, bonusDiamonds: e.target.value })} className="bg-black border-[#27272A] text-white" placeholder="e.g. 10, 20, 60" />
                <p className="text-xs text-zinc-500">Extra diamonds shown as a bonus to buyers.</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Price (PKR Rs.) *</Label>
                <Input type="number" step="1" min={0} required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Original Price (Rs.)</Label>
                <Input type="number" step="1" min={0} value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="bg-black border-[#27272A] text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Image URL *</Label>
              <Input required value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="bg-black border-[#27272A] text-white" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Sort Order</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="bg-black border-[#27272A] text-white" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-[#F5C518] text-black hover:bg-[#FFD700]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
