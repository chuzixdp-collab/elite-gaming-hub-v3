'use client';
import { useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GoldButton } from '@/components/shared/GoldButton';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, ArrowLeft, Send, Loader2 } from 'lucide-react';

export function ContactUsView() {
  const navigate = useNavigation((s) => s.navigate);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      toast.success('Message sent! We will respond within 24 hours.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'chuzixdp@gmail.com',
      href: 'mailto:chuzixdp@gmail.com',
      description: 'General inquiries, support tickets, refund requests'
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '0370 400 8015',
      href: 'tel:+923704008015',
      description: 'Mon - Sat, 9:00 AM - 9:00 PM PKT'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'Millat Road, Ramzan Chowk',
      href: '#',
      description: 'Chungi Amar Sidhu, Lahore, Punjab, Pakistan'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <button
          onClick={() => navigate('landing')}
          className="flex items-center gap-2 text-[#F5C518] hover:text-amber-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get In Touch</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Have a question about your order, a tournament, or need help with your account? Our team is here to help
            you 7 days a week.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((info, idx) => {
            const Icon = info.icon;
            return (
              <a
                key={idx}
                href={info.href}
                className="bg-[#0F0F0F] border border-[#27272A] hover:border-[#F5C518]/50 rounded-xl p-6 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#F5C518]/10 border border-[#F5C518]/30 flex items-center justify-center mb-4 group-hover:bg-[#F5C518]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#F5C518]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{info.title}</h3>
                <p className="text-[#F5C518] font-semibold mb-2 break-words">{info.value}</p>
                <p className="text-zinc-400 text-sm">{info.description}</p>
              </a>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-[#0F0F0F] border border-[#27272A] rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-zinc-300 mb-2 block">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="bg-[#141414] border-[#27272A] text-white placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-zinc-300 mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-[#141414] border-[#27272A] text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subject" className="text-zinc-300 mb-2 block">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="bg-[#141414] border-[#27272A] text-white placeholder:text-zinc-500"
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-zinc-300 mb-2 block">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  required
                  rows={6}
                  className="bg-[#141414] border-[#27272A] text-white placeholder:text-zinc-500 resize-none"
                />
              </div>
              <GoldButton type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </GoldButton>
            </form>
          </div>

          {/* Business Info & Hours */}
          <div className="space-y-6">
            <div className="bg-[#0F0F0F] border border-[#27272A] rounded-xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#F5C518]" />
                Business Hours
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-[#27272A]">
                  <span className="text-zinc-400">Monday - Friday</span>
                  <span className="text-white font-semibold">9:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#27272A]">
                  <span className="text-zinc-400">Saturday</span>
                  <span className="text-white font-semibold">10:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Sunday</span>
                  <span className="text-[#F5C518] font-semibold">Closed</span>
                </div>
              </div>
              <p className="text-zinc-500 text-xs mt-4">All times are in Pakistan Standard Time (PKT, UTC+5)</p>
            </div>

            <div className="bg-[#0F0F0F] border border-[#27272A] rounded-xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-4">Business Information</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-zinc-400 mb-1">Business Name</p>
                  <p className="text-white font-semibold">Elite Gaming Hub</p>
                </div>
                <div>
                  <p className="text-zinc-400 mb-1">Address</p>
                  <p className="text-white font-semibold">
                    Millat Road, Ramzan Chowk,<br />
                    Chungi Amar Sidhu, Lahore,<br />
                    Punjab, Pakistan
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 mb-1">Phone</p>
                  <a href="tel:+923704008015" className="text-[#F5C518] font-semibold hover:underline">
                    0370 400 8015
                  </a>
                </div>
                <div>
                  <p className="text-zinc-400 mb-1">Email</p>
                  <a href="mailto:chuzixdp@gmail.com" className="text-[#F5C518] font-semibold hover:underline break-all">
                    chuzixdp@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#141410] border border-[#F5C518]/30 rounded-xl p-6">
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-[#F5C518]">Need fast help?</strong> For urgent order issues or diamond
                delivery problems, please include your order ID and Free Fire player ID in your message for faster
                resolution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
