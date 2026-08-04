'use client';
import { useNavigation } from '@/store/navigation';
import { useCart } from '@/store/cart';
import { Card } from '@/components/ui/card';
import { GoldButton } from './GoldButton';
import { Crown, Check } from 'lucide-react';
import { formatPKR } from '@/lib/constants';

interface ProductCardProps {
  product: {
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
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigation((s) => s.navigate);
  const setProduct = useCart((s) => s.setProduct);

  const handleBuy = () => {
    setProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      category: product.category,
      diamonds: product.diamonds,
      bonusDiamonds: product.bonusDiamonds,
      slug: product.slug,
    });
    navigate('checkout');
  };

  const isMembership = product.category !== 'DIAMONDS';
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="overflow-hidden bg-[#141414] border-[#27272A] hover:border-[#F5C518]/50 transition-all duration-300 group relative flex flex-col">
      {discount > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
          -{discount}%
        </div>
      )}

      {/* Clean diamond image — NO text inside, just the premium icon */}
      <div className="relative aspect-square overflow-hidden bg-black flex items-center justify-center">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
        />
        {isMembership && (
          <div className="absolute top-3 left-3 bg-[#F5C518]/90 text-black text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
            <Crown className="w-3 h-3" /> MEMBER
          </div>
        )}
        {/* Subtle glow at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141414] to-transparent pointer-events-none" />
      </div>

      {/* Package name + price BELOW the image */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex-1">
          {/* Package name is the prominent headline now (no overlay on image) */}
          <h3 className="text-white font-bold text-lg leading-tight">{product.name}</h3>

          {/* Bonus diamonds badge (separate from image) */}
          {product.diamonds != null && product.bonusDiamonds != null && product.bonusDiamonds > 0 && (
            <div className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/40 text-[#F5C518] font-semibold">
              +{product.bonusDiamonds} BONUS
            </div>
          )}

          {product.description && (
            <p className="text-zinc-400 text-xs mt-2 line-clamp-2">{product.description}</p>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#F5C518]">{formatPKR(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-zinc-500 line-through">{formatPKR(product.originalPrice)}</span>
          )}
        </div>

        <GoldButton className="w-full" size="sm" onClick={handleBuy}>
          <Check className="w-4 h-4" /> Buy Now
        </GoldButton>
      </div>
    </Card>
  );
}
