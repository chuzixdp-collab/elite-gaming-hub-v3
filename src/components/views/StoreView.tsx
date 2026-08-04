'use client';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/shared/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  diamonds?: number | null;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
}

export function StoreView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'DIAMONDS' | 'WEEKLY_MEMBERSHIP' | 'MONTHLY_MEMBERSHIP'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (filter !== 'ALL' && p.category !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters = [
    { value: 'ALL' as const, label: 'All' },
    { value: 'DIAMONDS' as const, label: 'Diamonds' },
    { value: 'WEEKLY_MEMBERSHIP' as const, label: 'Weekly' },
    { value: 'MONTHLY_MEMBERSHIP' as const, label: 'Monthly' },
  ];

  return (
    <div className="min-h-screen bg-black py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/30 mb-3">
            <ShoppingBag className="w-3 h-3 text-[#F5C518]" />
            <span className="text-xs font-semibold text-[#F5C518] uppercase tracking-wider">Free Fire Store</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Top Up <span className="text-[#F5C518]">Diamonds</span> & Memberships
          </h1>
          <p className="text-zinc-400">Instant delivery to your Free Fire UID</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Button
                key={f.value}
                onClick={() => setFilter(f.value)}
                variant={filter === f.value ? 'default' : 'outline'}
                className={
                  filter === f.value
                    ? 'bg-[#F5C518] text-black hover:bg-[#FFD700] font-semibold'
                    : 'bg-transparent border-[#27272A] text-zinc-300 hover:text-white hover:border-[#F5C518]/50'
                }
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#141414] border-[#27272A] text-white pl-10"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square bg-[#141414]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No products match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
