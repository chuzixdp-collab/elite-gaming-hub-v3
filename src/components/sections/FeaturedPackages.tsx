'use client';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/shared/ProductCard';
import { GoldButton } from '@/components/shared/GoldButton';
import { useNavigation } from '@/store/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  diamonds?: number | null;
  bonusDiamonds?: number | null;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
}

export function FeaturedPackages() {
  const navigate = useNavigation((s) => s.navigate);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/30 mb-3">
              <span className="text-xs font-semibold text-[#F5C518] uppercase tracking-wider">Top-Up Now</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Diamond <span className="text-[#F5C518]">Packages</span>
            </h2>
            <p className="text-zinc-400">Instant delivery to your Free Fire UID. Best prices guaranteed.</p>
          </div>
          <GoldButton variant="outline-gold" onClick={() => navigate('store')}>
            View Full Store
          </GoldButton>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square bg-[#141414]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
