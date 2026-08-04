'use client';
import { useNavigation } from '@/store/navigation';
import { ArrowLeft, Shield } from 'lucide-react';

export function PrivacyPolicyView() {
  const navigate = useNavigation((s) => s.navigate);

  const sections = [
    {
      title: '1. Introduction',
      body: 'Elite Gaming Hub ("we", "us", or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website elite-gaming-hub-v3.netlify.app and related services. By accessing or using our platform, you consent to the data practices described in this policy. We comply with applicable data protection laws of Pakistan, including the Prevention of Electronic Crimes Act (PECA) 2016.'
    },
    {
      title: '2. Information We Collect',
      body: 'We collect information that you provide directly to us when you create an account, place an order, participate in tournaments, or contact our support team. This includes your name, email address, phone number, Free Fire player ID, and payment transaction references. We also automatically collect certain technical data such as your IP address, browser type, device information, and usage patterns through cookies and similar technologies.'
    },
    {
      title: '3. How We Use Your Information',
      body: 'Your information is used to process diamond top-up orders, verify tournament registrations, deliver prizes, send order confirmations, provide customer support, prevent fraud, and improve our services. We may also use your contact details to send you important notifications about your account, security alerts, and promotional offers related to Elite Gaming Hub services. You can opt out of marketing communications at any time.'
    },
    {
      title: '4. Information Sharing',
      body: 'We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers who assist us in operating our platform, such as payment processors (EasyPaisa, PayFast), database hosting providers (Neon PostgreSQL), and delivery services (Netlify). These parties are bound by confidentiality obligations and may only use your data to provide services to us. We may disclose information when required by law or to protect our legal rights.'
    },
    {
      title: '5. Data Security',
      body: 'We implement industry-standard security measures including SSL/TLS encryption, hashed passwords using bcrypt, secure session management with JWT tokens, and regular security audits. Your payment information is never stored on our servers — all transactions are processed through PCI-compliant payment gateways. Despite our efforts, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.'
    },
    {
      title: '6. Data Retention',
      body: 'We retain your personal data for as long as your account is active or as necessary to provide our services. Order records, transaction history, and tournament participation data are kept for a minimum of 5 years for accounting and dispute resolution purposes. You may request deletion of your account and associated data, subject to our legal retention obligations.'
    },
    {
      title: '7. Your Rights',
      body: 'You have the right to access, correct, update, or delete your personal information. You can also object to certain processing of your data or request data portability. To exercise these rights, contact us at chuzixdp@gmail.com. We will respond to your request within 30 days. If you are unsatisfied with our response, you may lodge a complaint with the Pakistan Telecommunication Authority (PTA).'
    },
    {
      title: '8. Cookies Policy',
      body: 'We use cookies and similar technologies to enhance your browsing experience, remember your preferences, analyze site traffic, and serve relevant content. You can control cookies through your browser settings, but disabling them may affect functionality of certain features such as login sessions and shopping cart. We use both session cookies (expire when you close your browser) and persistent cookies (remain until expiration or deletion).'
    },
    {
      title: "9. Children's Privacy",
      body: 'Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately at chuzixdp@gmail.com, and we will take steps to delete it. Parents or guardians must supervise minors using our platform, especially for transactions involving real money.'
    },
    {
      title: '10. Third-Party Links',
      body: 'Our website may contain links to third-party websites or services such as Garena (Free Fire), EasyPaisa, and PayFast. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit. Your interactions with third-party services are solely between you and that service provider.'
    },
    {
      title: '11. Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by posting the updated policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically. Continued use of our services after changes constitutes acceptance of the updated policy.'
    },
    {
      title: '12. Contact Us',
      body: 'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at: Elite Gaming Hub, Email: chuzixdp@gmail.com, Phone: 03704008015, Address: Millat Road, Ramzan Chowk, Chungi Amar Sidhu, Lahore, Punjab, Pakistan. Our support team is available during business hours (9:00 AM to 9:00 PM PKT, Monday to Saturday).'
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
          <Shield className="w-10 h-10 text-[#F5C518]" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
            <p className="text-zinc-400 text-sm mt-1">Last updated: August 3, 2026</p>
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-[#27272A] rounded-xl p-6 md:p-8 mb-6">
          <p className="text-zinc-300 leading-relaxed">
            At Elite Gaming Hub, we take your privacy seriously. This Privacy Policy outlines how we collect, use,
            protect, and share your personal information when you use our Free Fire diamond top-up and tournament
            platform. By using our services, you agree to the terms described below.
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
            For any privacy-related questions, contact us at{' '}
            <a href="mailto:chuzixdp@gmail.com" className="text-[#F5C518] hover:text-amber-300 underline">
              chuzixdp@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
