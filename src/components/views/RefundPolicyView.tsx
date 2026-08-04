'use client';
import { useNavigation } from '@/store/navigation';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export function RefundPolicyView() {
  const navigate = useNavigation((s) => s.navigate);

  const sections = [
    {
      title: '1. Refund Policy Overview',
      body: 'At Elite Gaming Hub, we strive to deliver the best service for your Free Fire diamond top-ups, memberships, and tournament entries. This Refund Policy outlines the circumstances under which refunds are granted and the process for requesting them. Since our services involve digital goods delivered instantly, refund eligibility is limited and subject to the conditions described below.'
    },
    {
      title: '2. Digital Products',
      body: 'Diamond top-ups and memberships are digital products delivered electronically to your Free Fire account. Due to the instant nature of digital delivery, refunds are only available in cases where the product was not delivered, was delivered incorrectly due to our error, or was substantially different from what was described. Refunds are not available for change-of-mind purchases.'
    },
    {
      title: '3. Tournament Entry Fees',
      body: 'Tournament entry fees are non-refundable once registration is confirmed. If a tournament is canceled by Elite Gaming Hub due to insufficient participants or technical issues, full refunds will be issued to participants within 7 business days. If you are unable to participate due to personal reasons, no refund will be provided. Tournament disqualifications due to rule violations are not eligible for refunds.'
    },
    {
      title: '4. Eligibility for Refunds',
      body: 'You may be eligible for a refund if: (a) your diamond top-up was not delivered within 24 hours; (b) diamonds were delivered to a wrong account due to our system error; (c) you were charged multiple times for a single order; (d) the product description was materially misleading; or (e) you experienced unauthorized charges on your account. Refund requests must be made within 7 days of the transaction date.'
    },
    {
      title: '5. Non-Refundable Cases',
      body: 'Refunds will not be granted in the following cases: (a) incorrect Free Fire player ID provided by the customer; (b) diamonds already delivered successfully to the provided ID; (c) account suspension due to Terms violations; (d) change of mind after purchase; (e) failure to participate in a tournament you registered for; (f) wallet balance or referral bonus misuse; (g) duplicate orders placed by the customer.'
    },
    {
      title: '6. Refund Process',
      body: 'To request a refund, contact our support team at chuzixdp@gmail.com with your order ID, transaction ID, Free Fire player ID, and a detailed explanation of the issue. Our team will review your request within 3 business days. Approved refunds will be processed to your original payment method (EasyPaisa or bank transfer) within 7-10 business days. Wallet credits, if applicable, will be reflected in your account immediately upon approval.'
    },
    {
      title: '7. Processing Time',
      body: 'Refund processing time depends on your payment method: EasyPaisa refunds typically take 3-5 business days, while bank transfers may take 7-10 business days. We are not responsible for delays caused by payment processors or banks. Once a refund is initiated from our end, you will receive a confirmation email with the refund reference number. Status updates can be requested at chuzixdp@gmail.com.'
    },
    {
      title: '8. Partial Refunds',
      body: 'In certain cases, partial refunds may be granted if only a portion of the service was delivered. For example, if you ordered 1060 diamonds but only 520 were delivered, we will either deliver the remaining 540 diamonds or refund the proportional amount. Partial refunds are issued at our discretion based on the circumstances and supporting evidence provided by the customer.'
    },
    {
      title: '9. Chargebacks',
      body: 'We discourage chargebacks as a first resort. Please contact our support team to resolve any disputes before initiating a chargeback with your bank or EasyPaisa. Unjustified chargebacks may result in account suspension and a permanent ban from Elite Gaming Hub. If a chargeback is initiated, we reserve the right to dispute it with evidence of service delivery and to recover any associated fees from the customer.'
    },
    {
      title: '10. Contact Us',
      body: 'For refund requests or questions about this Refund Policy, contact us at: Elite Gaming Hub, Email: chuzixdp@gmail.com, Phone: 03704008015, Address: Millat Road, Ramzan Chowk, Chungi Amar Sidhu, Lahore, Punjab, Pakistan. Include your order details and transaction ID in all refund correspondence for faster processing. Our support team is available 9:00 AM to 9:00 PM PKT, Monday to Saturday.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <button
          onClick={() => navigate('landing')}
          className="flex items-center gap-2 text-[#F5C518] hover:text-amber-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="flex items-center gap-3 mb-8">
          <RotateCcw className="w-10 h-10 text-[#F5C518]" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Refund Policy</h1>
            <p className="text-zinc-400 text-sm mt-1">Last updated: August 3, 2026</p>
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-[#27272A] rounded-xl p-6 md:p-8 mb-6">
          <p className="text-zinc-300 leading-relaxed">
            This Refund Policy explains the terms under which Elite Gaming Hub issues refunds for digital products
            and services. Please read this policy carefully before making a purchase. By placing an order on our
            platform, you acknowledge that you have read and understood this Refund Policy.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-[#0F0F0F] border border-[#27272A] rounded-xl p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-[#F5C518] mb-3">{section.title}</h2>
              <p className="text-zinc-300 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-[#141410] border border-[#F5C518]/30 rounded-xl">
          <p className="text-zinc-300 text-sm">
            For refund requests, contact us at{' '}
            <a href="mailto:chuzixdp@gmail.com" className="text-[#F5C518] hover:text-amber-300 underline">
              chuzixdp@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
