'use client';
import { useNavigation } from '@/store/navigation';
import { ArrowLeft, FileText } from 'lucide-react';

export function TermsConditionsView() {
  const navigate = useNavigation((s) => s.navigate);

  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: 'Welcome to Elite Gaming Hub. By accessing or using our website elite-gaming-hub-v3.netlify.app and related services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services. Your continued use of the platform constitutes acceptance of any updates or modifications we may make to these terms.'
    },
    {
      title: '2. Eligibility',
      body: 'You must be at least 13 years old to use our services. If you are under 18, you must obtain consent from a parent or legal guardian before creating an account or making any transactions. By registering an account, you represent and warrant that you meet these eligibility requirements and that the information you provide is accurate and complete.'
    },
    {
      title: '3. Account Registration',
      body: 'To access certain features of Elite Gaming Hub, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.'
    },
    {
      title: '4. Diamond Top-Up Service',
      body: 'Elite Gaming Hub provides Free Fire diamond top-up services. When you place an order, you must provide a valid Free Fire player ID. We are not responsible for diamonds delivered to an incorrect ID due to user error. Delivery is typically instant but may take up to 24 hours in case of technical issues. Prices are listed in Pakistani Rupees (PKR) and are subject to change without prior notice.'
    },
    {
      title: '5. Membership Subscriptions',
      body: 'We offer weekly and monthly Free Fire membership plans. Subscriptions are non-refundable once activated unless the service is not delivered due to our fault. Membership benefits are provided by Garena and we act as a reseller. We are not responsible for any changes Garena may make to membership benefits or structure. Failed membership activations due to invalid player IDs are not eligible for refunds.'
    },
    {
      title: '6. Tournament Participation',
      body: 'Elite Gaming Hub hosts competitive tournaments with real cash prizes. To participate, you must register using your Elite Gaming Hub account and pay the entry fee (if applicable). Tournament rules, schedules, and prize structures are posted on each tournament page. Cheating, teaming, or any form of unfair play will result in immediate disqualification without refund. Prize winners must claim their prizes within 30 days.'
    },
    {
      title: '7. Payments and EasyPaisa',
      body: 'We accept payments via EasyPaisa and other methods listed on our platform. After making a payment, you must submit the transaction ID through our payment verification system. Orders are processed only after payment verification. We are not liable for payments sent to incorrect EasyPaisa numbers. Always verify the EasyPaisa number displayed on our website before sending money. Fraudulent payment claims will result in account suspension.'
    },
    {
      title: '8. Referral Program',
      body: 'Our referral program rewards users for inviting friends to Elite Gaming Hub. Referral bonuses are credited to your wallet and can be used for purchases. We reserve the right to modify referral bonus amounts, eligibility criteria, or terminate the program at any time. Abuse of the referral system, including creating fake accounts or self-referrals, will result in forfeiture of referral bonuses and account suspension.'
    },
    {
      title: '9. Wallet and Balance',
      body: 'Your Elite Gaming Hub wallet stores referral bonuses and other credits. Wallet balance is non-transferable to other users and cannot be withdrawn to bank accounts or EasyPaisa unless explicitly stated. Wallet balance has no cash value outside the platform. We reserve the right to deduct incorrectly credited amounts from your wallet. Wallet balance expires after 12 months of account inactivity.'
    },
    {
      title: '10. Prize Claims',
      body: 'Tournament winners must claim their prizes through the Prize Claims section of their dashboard. Cash prizes are paid via EasyPaisa or bank transfer. You must provide accurate payment details when claiming. Prize claims are processed within 7 business days. Failure to claim a prize within 30 days of winning will result in forfeiture. We may require identity verification before processing large prize payouts.'
    },
    {
      title: '11. Prohibited Conduct',
      body: 'You agree not to engage in any of the following: (a) using bots, scripts, or automated tools to access our services; (b) attempting to hack, disrupt, or compromise our security; (c) creating multiple accounts to abuse promotions; (d) submitting false payment information; (e) harassing other users or staff; (f) reverse engineering or copying our platform; (g) using our services for illegal activities. Violations may result in account termination and legal action.'
    },
    {
      title: '12. Intellectual Property',
      body: 'All content on Elite Gaming Hub, including the logo, design, text, graphics, and software, is the property of Elite Gaming Hub and protected by Pakistani and international copyright laws. Free Fire and related trademarks are property of Garena. You may not reproduce, distribute, or create derivative works from our content without prior written consent. Trademarks of third parties are acknowledged as their respective owners\' property.'
    },
    {
      title: '13. Limitation of Liability',
      body: 'Elite Gaming Hub is provided "as is" without warranties of any kind. We are not liable for indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability for any claim shall not exceed the amount you paid to us in the 30 days preceding the claim. We are not responsible for service interruptions caused by Garena, EasyPaisa, or other third-party service providers.'
    },
    {
      title: '14. Account Termination',
      body: 'You may delete your account at any time by contacting support. We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason we deem appropriate. Upon termination, your wallet balance and pending prize claims may be forfeited. Outstanding orders will be completed unless legally prohibited.'
    },
    {
      title: '15. Governing Law',
      body: 'These Terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes arising from these Terms or your use of Elite Gaming Hub shall be resolved exclusively in the courts of Lahore, Punjab, Pakistan. We may change the governing law upon notice to you if we operate from a different jurisdiction in the future.'
    },
    {
      title: '16. Contact Us',
      body: 'For any questions about these Terms and Conditions, please contact us at: Elite Gaming Hub, Email: chuzixdp@gmail.com, Phone: 03704008015, Address: Millat Road, Ramzan Chowk, Chungi Amar Sidhu, Lahore, Punjab, Pakistan. Our support team responds within 24 hours during business days.'
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
          <FileText className="w-10 h-10 text-[#F5C518]" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Terms &amp; Conditions</h1>
            <p className="text-zinc-400 text-sm mt-1">Last updated: August 3, 2026</p>
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-[#27272A] rounded-xl p-6 md:p-8 mb-6">
          <p className="text-zinc-300 leading-relaxed">
            Welcome to Elite Gaming Hub. These Terms and Conditions govern your use of our Free Fire diamond top-up
            and tournament platform. Please read these terms carefully before using our services. By creating an
            account or placing an order, you acknowledge that you have read, understood, and agree to be bound by
            these terms.
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
            For any questions about these terms, contact us at{' '}
            <a href="mailto:chuzixdp@gmail.com" className="text-[#F5C518] hover:text-amber-300 underline">
              chuzixdp@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
