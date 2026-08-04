import { ok } from '@/lib/api';

const STATIC_FAQS = [
  {
    id: '1',
    question: 'How fast will I receive my diamonds after payment?',
    answer:
      'Diamonds are delivered instantly to your Free Fire UID once your EasyPaisa payment is approved by our team (usually within 5-30 minutes). You will get a notification when payment is approved and another when diamonds are delivered.',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer:
      'We currently accept EasyPaisa only. Send payment to our official EasyPaisa number 0312-4376721, then upload your Transaction ID and payment screenshot. Our admin verifies and approves your order.',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: '3',
    question: 'Are tournaments free to join?',
    answer:
      'We host daily, weekly and monthly tournaments. Some are free entry; others require an entry fee in PKR. Each tournament lists its entry fee, prize pool, and rules clearly. Pay via EasyPaisa and upload proof to register.',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: '4',
    question: 'How do tournament prizes get distributed?',
    answer:
      'Prizes are distributed by our admin team after the tournament ends and results are published. Cash prizes are sent via EasyPaisa within 24-48 hours. Diamond prizes are credited directly to your Free Fire UID.',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: '5',
    question: 'Is my account information secure?',
    answer:
      'Yes. We use bcrypt password hashing, JWT-based authentication with HTTP-only cookies, CSRF protection, and rate limiting. We never store your password in plain text. Payment screenshots are stored securely and viewable only by admins.',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: '6',
    question: 'What if I entered the wrong Free Fire UID?',
    answer:
      'Please double-check your UID before placing an order — we cannot recover diamonds delivered to the wrong account. However, if you contact us immediately (within 5 minutes) before delivery, we may be able to cancel and re-process the order.',
    sortOrder: 6,
    isActive: true,
  },
];

export async function GET() {
  return ok({ faqs: STATIC_FAQS });
}
