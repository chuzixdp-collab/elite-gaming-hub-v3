'use client';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    q: 'How fast will I receive my diamonds after payment?',
    a: 'Diamonds are delivered instantly to your Free Fire UID once your payment is confirmed. Most payments are processed within 30 seconds. If you don\'t receive your diamonds within 5 minutes, please contact our 24/7 support team with your order number.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We support multiple payment methods including bKash, Nagad, Rocket, Visa/Mastercard credit and debit cards, UPI, and PayPal. All transactions are encrypted and processed through secure payment gateways.',
  },
  {
    q: 'Are tournaments free to join?',
    a: 'We host daily tournaments that are completely free to enter, as well as weekly and monthly championships with entry fees. Free tournaments still offer real prize pools. Paid tournaments typically have larger prize pools and more competitive gameplay.',
  },
  {
    q: 'How do tournament prizes get distributed?',
    a: 'Prize distribution is handled by our admin team after tournament completion. Winners are announced on the platform and contacted via email/notifications. Cash prizes are typically distributed within 24-48 hours of result publication. Diamond prizes are credited directly to your Free Fire UID.',
  },
  {
    q: 'Is my account information secure?',
    a: 'Absolutely. We use bcrypt password hashing (industry-standard), JWT-based authentication with HTTP-only cookies, CSRF protection, and rate limiting. We never store your payment card details — all payments are handled by PCI-compliant payment providers.',
  },
  {
    q: 'Can I get a refund if my order fails?',
    a: 'Yes. If your payment succeeds but diamonds are not delivered due to an error on our end, we will either re-process your order or issue a full refund. Refunds are processed to your original payment method within 3-5 business days. Contact support with your order number to request a refund.',
  },
  {
    q: 'What if I entered the wrong Free Fire UID?',
    a: 'Please double-check your UID before placing an order — we cannot recover diamonds delivered to the wrong account. However, if you contact us immediately (within 5 minutes) before delivery, we may be able to cancel and re-process the order with the correct UID.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/30 mb-3">
            <span className="text-xs font-semibold text-[#F5C518] uppercase tracking-wider">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Frequently Asked <span className="text-[#F5C518]">Questions</span>
          </h2>
          <p className="text-zinc-400">Everything you need to know about Elite Gaming Hub</p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-[#141414] border border-[#27272A] rounded-lg px-4">
              <AccordionTrigger className="text-white font-semibold text-left hover:text-[#F5C518] hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-sm leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
