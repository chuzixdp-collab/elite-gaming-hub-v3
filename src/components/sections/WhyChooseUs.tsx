'use client';
import { Zap, Headphones, ShieldCheck, DollarSign } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-7 h-7" />,
    title: 'Instant Delivery',
    description: 'Diamonds and memberships delivered to your UID within seconds of payment confirmation. No waiting, no delays.',
  },
  {
    icon: <Headphones className="w-7 h-7" />,
    title: '24/7 Support',
    description: 'Our dedicated support team is available round the clock. Get help with orders, tournaments, or any issue — anytime.',
  },
  {
    icon: <ShieldCheck className="w-7 h-7" />,
    title: 'Secure Payments',
    description: 'Bank-grade encryption, multiple payment methods, and full transaction tracking. Your data and money are protected.',
  },
  {
    icon: <DollarSign className="w-7 h-7" />,
    title: 'Best Prices',
    description: 'Lowest diamond prices online, with regular coupons and loyalty discounts. Get more for your money.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0A0A0A] to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/30 mb-3">
            <span className="text-xs font-semibold text-[#F5C518] uppercase tracking-wider">Why Elite Gaming Hub</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Built for <span className="text-[#F5C518]">Champions</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            We&apos;ve crafted the ultimate gaming hub with everything you need to dominate — top-ups, tournaments, and a thriving community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#141414] border border-[#27272A] rounded-xl p-6 hover:border-[#F5C518]/50 hover:shadow-[0_0_30px_rgba(245,197,24,0.1)] transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F5C518]/20 to-[#DC2626]/20 border border-[#F5C518]/30 flex items-center justify-center text-[#F5C518] mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
