'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { Twitter, Youtube, Instagram, MessageCircle, Smartphone, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_EASYPAISA_NUMBER } from '@/lib/constants';

export function Footer() {
  const navigate = useNavigation((s) => s.navigate);
  const [easypaisaNumber, setEasypaisaNumber] = useState<string>(DEFAULT_EASYPAISA_NUMBER);

  useEffect(() => {
    fetch('/api/settings/payment')
      .then((r) => r.json())
      .then((d) => { if (d.easypaisaNumber) setEasypaisaNumber(d.easypaisaNumber); })
      .catch(() => {});
  }, []);

  const copyEasyPaisa = () => {
    navigator.clipboard.writeText(easypaisaNumber);
    toast.success('EasyPaisa number copied!');
  };

  return (
    <footer className="mt-auto bg-black border-t border-[#27272A]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Elite Gaming Hub" className="w-10 h-10 rounded-lg object-contain" />
              <div>
                <div className="text-white font-bold text-base">ELITE</div>
                <div className="text-[#F5C518] text-[10px] font-semibold tracking-widest">GAMING HUB</div>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              The premier destination for Free Fire diamond top-ups and competitive tournaments. Instant delivery, secure EasyPaisa payments, real prizes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('landing')} className="text-zinc-400 hover:text-[#F5C518] transition-colors">Home</button></li>
              <li><button onClick={() => navigate('store')} className="text-zinc-400 hover:text-[#F5C518] transition-colors">Diamond Store</button></li>
              <li><button onClick={() => navigate('tournaments')} className="text-zinc-400 hover:text-[#F5C518] transition-colors">Tournaments</button></li>
              <li><button onClick={() => navigate('signup')} className="text-zinc-400 hover:text-[#F5C518] transition-colors">Create Account</button></li>
              <li><button onClick={() => navigate('login')} className="text-zinc-400 hover:text-[#F5C518] transition-colors">Login</button></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('contact-us')} className="text-zinc-400 hover:text-[#F5C518] transition-colors text-left">Contact Us</button></li>
              <li><button onClick={() => navigate('landing', { scrollTo: 'faq' })} className="text-zinc-400 hover:text-[#F5C518] transition-colors text-left">FAQ</button></li>
              <li><button onClick={() => navigate('terms-conditions')} className="text-zinc-400 hover:text-[#F5C518] transition-colors text-left">Terms &amp; Conditions</button></li>
              <li><button onClick={() => navigate('privacy-policy')} className="text-zinc-400 hover:text-[#F5C518] transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => navigate('refund-policy')} className="text-zinc-400 hover:text-[#F5C518] transition-colors text-left">Refund Policy</button></li>
            </ul>
          </div>

          {/* EasyPaisa & Social */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">EasyPaisa Payments</h4>
            <div className="p-3 bg-[#141414] border border-[#F5C518]/30 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-[#F5C518]" />
                <div className="text-xs text-zinc-400">Send payments to:</div>
                <button onClick={copyEasyPaisa} className="ml-auto text-[#F5C518] hover:text-amber-300" title="Copy">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="text-white font-bold text-lg tracking-wider">{easypaisaNumber}</div>
            </div>
            <div className="flex gap-3 mb-2">
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-[#141414] border border-[#27272A] flex items-center justify-center text-zinc-400 hover:text-[#F5C518] hover:border-[#F5C518]/50 transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-lg bg-[#141414] border border-[#27272A] flex items-center justify-center text-zinc-400 hover:text-[#F5C518] hover:border-[#F5C518]/50 transition-all"><Youtube className="w-4 h-4" /></a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-[#141414] border border-[#27272A] flex items-center justify-center text-zinc-400 hover:text-[#F5C518] hover:border-[#F5C518]/50 transition-all"><Instagram className="w-4 h-4" /></a>
              <a href="#" aria-label="Discord" className="w-9 h-9 rounded-lg bg-[#141414] border border-[#27272A] flex items-center justify-center text-zinc-400 hover:text-[#F5C518] hover:border-[#F5C518]/50 transition-all"><MessageCircle className="w-4 h-4" /></a>
            </div>
            <div className="text-xs text-zinc-500 mb-2">We accept:</div>
            <div className="flex flex-wrap gap-1.5">
              {['EasyPaisa', 'JazzCash', 'Cash on Delivery'].map((m) => (
                <span key={m} className="text-[10px] bg-[#141414] border border-[#27272A] text-zinc-400 px-2 py-1 rounded">{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#27272A] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500">© 2026 Elite Gaming Hub. All rights reserved. Not affiliated with Garena.</p>
          <p className="text-xs text-zinc-500">Built with ❤️ for Pakistani gamers • Prices in PKR</p>
        </div>
      </div>
    </footer>
  );
}
