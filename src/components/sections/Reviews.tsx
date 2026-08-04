'use client';
import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  avatarUrl?: string | null;
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/30 mb-3">
            <Star className="w-3 h-3 text-[#F5C518]" />
            <span className="text-xs font-semibold text-[#F5C518] uppercase tracking-wider">Player Reviews</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            What Players <span className="text-[#F5C518]">Say</span>
          </h2>
          <p className="text-zinc-400">Real reviews from real players in our community</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 bg-[#141414]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-[#141414] border border-[#27272A] rounded-xl p-6 hover:border-[#F5C518]/30 transition-all relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-[#F5C518]/20" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5C518] to-[#DC2626] flex items-center justify-center text-black font-bold">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{r.name}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-[#F5C518] text-[#F5C518]' : 'text-zinc-600'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
