'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GoldButton } from '@/components/shared/GoldButton';
import { Mail, MessageSquare, Send, Loader2 } from 'lucide-react';

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      toast.success('Message sent!', { description: 'Our team will respond within 24 hours.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message', { description: err instanceof Error ? err.message : 'Try again later' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-black">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/30 mb-3">
              <span className="text-xs font-semibold text-[#F5C518] uppercase tracking-wider">Get In Touch</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Have <span className="text-[#F5C518]">Questions?</span>
            </h2>
            <p className="text-zinc-400 mb-6">
              Whether you need help with an order, have tournament questions, or want to partner with us — our team is here to help.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F5C518]/10 border border-[#F5C518]/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#F5C518]" />
                </div>
                <div>
                  <div className="text-zinc-400 text-xs">Email us</div>
                  <a href="mailto:support@elitegaming.com" className="text-white font-semibold hover:text-[#F5C518]">support@elitegaming.com</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F5C518]/10 border border-[#F5C518]/30 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#F5C518]" />
                </div>
                <div>
                  <div className="text-zinc-400 text-xs">Response time</div>
                  <div className="text-white font-semibold">Within 24 hours</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#141414] border border-[#27272A] rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-black border-[#27272A] text-white" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-black border-[#27272A] text-white" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-zinc-300">Subject</Label>
              <Input id="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="bg-black border-[#27272A] text-white" placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-zinc-300">Message</Label>
              <Textarea id="message" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-black border-[#27272A] text-white min-h-[100px]" placeholder="Tell us more..." />
            </div>
            <GoldButton type="submit" disabled={submitting} className="w-full">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
            </GoldButton>
          </form>
        </div>
      </div>
    </section>
  );
}
