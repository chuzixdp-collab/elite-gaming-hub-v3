import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

// Generate a unique referral code (8-char base36)
function genReferralCode(seed: string): string {
  const base = Buffer.from(seed).toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase();
  const suffix = Math.floor(Math.random() * 9000 + 1000).toString();
  return `${base}${suffix}`;
}

// Clean diamond icon — NO text inside, just a premium diamond shape
function cleanDiamondSvg(color: string): string {
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${color}"/><stop offset="50%" stop-color="${color}"/><stop offset="100%" stop-color="${color}88"/></linearGradient><radialGradient id="shine" cx="0.3" cy="0.3" r="0.5"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="400" height="400" fill="#0F0F0F"/><path d="M200 60 L340 200 L200 340 L60 200 Z" fill="url(#g)" stroke="${color}" stroke-width="4"/><path d="M200 60 L340 200 L200 340 L60 200 Z" fill="url(#shine)" /><path d="M200 60 L200 340" stroke="${color}" stroke-width="2" opacity="0.5"/><path d="M60 200 L340 200" stroke="${color}" stroke-width="2" opacity="0.5"/><path d="M200 60 L130 200 L200 340 L270 200 Z" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function membershipSvg(label: string, sub: string, color: string): string {
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="${color}88"/></linearGradient></defs><rect width="400" height="400" fill="#0F0F0F"/><path d="M200 80 L260 180 L380 200 L290 270 L320 380 L200 320 L80 380 L110 270 L20 200 L140 180 Z" fill="url(#g)" stroke="${color}" stroke-width="3"/><text x="200" y="220" font-family="Arial" font-size="48" font-weight="bold" fill="#0A0A0A" text-anchor="middle">${label}</text><text x="200" y="265" font-family="Arial" font-size="22" font-weight="bold" fill="#0A0A0A" text-anchor="middle">${sub}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function tournamentBanner(title: string, type: string): string {
  const colors: Record<string, string> = { DAILY: '#F5C518', WEEKLY: '#FB923C', MONTHLY: '#DC2626' };
  const color = colors[type] || '#F5C518';
  const svg = `<svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0A0A0A"/><stop offset="50%" stop-color="#1F1F1F"/><stop offset="100%" stop-color="#0A0A0A"/></linearGradient></defs><rect width="1200" height="400" fill="url(#g)"/><circle cx="900" cy="200" r="180" fill="${color}22"/><circle cx="900" cy="200" r="120" fill="${color}44"/><circle cx="900" cy="200" r="60" fill="${color}88"/><text x="80" y="180" font-family="Arial" font-size="64" font-weight="bold" fill="${color}">${title}</text><text x="80" y="240" font-family="Arial" font-size="32" fill="#FFFFFF">${type} TOURNAMENT</text><text x="80" y="290" font-family="Arial" font-size="22" fill="#A1A1AA">Compete. Win. Dominate.</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function main() {
  console.log('🌱 Seeding Elite Gaming Hub database (PKR + EasyPaisa)...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const admin = await db.user.upsert({
    where: { email: 'chuzixdp@gmail.com' },
    update: {},
    create: {
      email: 'chuzixdp@gmail.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      referralCode: genReferralCode('chuzixdp'),
    },
  });
  // Ensure wallet exists for admin
  await db.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, balance: 0 },
  });
  console.log(`✅ Admin user: ${admin.email} / Admin@12345 (referral: ${admin.referralCode})`);

  // Create demo user
  const demoPassword = await bcrypt.hash('User@12345', 10);
  const demo = await db.user.upsert({
    where: { email: 'user@elitegaming.com' },
    update: {},
    create: {
      email: 'user@elitegaming.com',
      name: 'Demo Player',
      passwordHash: demoPassword,
      role: 'USER',
      emailVerified: true,
      ffUid: '1234567890',
      ffNickname: 'ProGamer2026',
      referralCode: genReferralCode('user'),
    },
  });
  await db.wallet.upsert({
    where: { userId: demo.id },
    update: {},
    create: { userId: demo.id, balance: 0 },
  });
  console.log(`✅ Demo user: ${demo.email} / User@12345 (referral: ${demo.referralCode})`);

  // Products — clean diamond images (no text inside), name shown below the image
  const products = [
    { slug: 'diamonds-100',  name: '100 Diamonds',  description: 'Instant delivery of 100 Free Fire diamonds to your UID.',  category: 'DIAMONDS', diamonds: 100,  bonusDiamonds: 0,  price: 199,  originalPrice: 249,  imageUrl: cleanDiamondSvg('#F5C518'), sortOrder: 1 },
    { slug: 'diamonds-310',  name: '310 Diamonds',  description: 'Best value pack — 310 diamonds delivered instantly.',     category: 'DIAMONDS', diamonds: 310,  bonusDiamonds: 10, price: 599,  originalPrice: 699,  imageUrl: cleanDiamondSvg('#F5C518'), sortOrder: 2 },
    { slug: 'diamonds-520',  name: '520 Diamonds',  description: '520 diamonds with bonus — top up your account now.',       category: 'DIAMONDS', diamonds: 520,  bonusDiamonds: 20, price: 999,  originalPrice: 1199, imageUrl: cleanDiamondSvg('#F5C518'), sortOrder: 3 },
    { slug: 'diamonds-1060', name: '1060 Diamonds', description: 'Mega pack — 1060 diamonds + bonus rewards.',                category: 'DIAMONDS', diamonds: 1060, bonusDiamonds: 60, price: 1999, originalPrice: 2499, imageUrl: cleanDiamondSvg('#FFD700'), sortOrder: 4 },
    { slug: 'weekly-membership',  name: 'Weekly Membership',  description: 'Unlock weekly membership — exclusive rewards, daily diamonds, and bonuses.',  category: 'WEEKLY_MEMBERSHIP',   diamonds: null, bonusDiamonds: 0, price: 499,  originalPrice: 699,  imageUrl: membershipSvg('WEEKLY',  'MEMBER', '#F5C518'), sortOrder: 5 },
    { slug: 'monthly-membership', name: 'Monthly Membership', description: 'Monthly membership — best value with massive daily diamond rewards and exclusive items.', category: 'MONTHLY_MEMBERSHIP', diamonds: null, bonusDiamonds: 0, price: 1499, originalPrice: 1999, imageUrl: membershipSvg('MONTHLY', 'MEMBER', '#DC2626'), sortOrder: 6 },
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: { id: undefined, ...p, isActive: true } as never,
    });
  }
  console.log(`✅ ${products.length} products seeded (PKR pricing, clean diamond images)`);

  // ============================================================
  // Tournaments — keep ONLY Weekly BR Match (admin creates the rest dynamically)
  // ============================================================
  const now = new Date();
  const tournaments = [
    {
      slug: 'weekly-br-match-' + now.getTime(),
      title: 'Weekly BR Match',
      type: 'WEEKLY',
      bannerUrl: tournamentBanner('Weekly BR Match', 'WEEKLY'),
      description: 'Weekly Battle Royale match. Top 3 players win cash prizes. Solo entry. Join via EasyPaisa payment — admin verifies and approves your slot.',
      startDateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      entryFee: 100,
      prizePool: 5000,
      totalSlots: 48,
      status: 'REGISTRATION_OPEN',
    },
  ];

  for (const t of tournaments) {
    const existing = await db.tournament.findUnique({ where: { slug: t.slug } });
    if (existing) continue;
    const tournament = await db.tournament.create({ data: t });
    await db.tournamentReward.createMany({
      data: [
        { tournamentId: tournament.id, position: 1, prizeAmount: t.prizePool * 0.5, prizeDescription: '1st Place — Champion' },
        { tournamentId: tournament.id, position: 2, prizeAmount: t.prizePool * 0.3, prizeDescription: '2nd Place — Runner-up' },
        { tournamentId: tournament.id, position: 3, prizeAmount: t.prizePool * 0.2, prizeDescription: '3rd Place — Bronze' },
      ],
    });
  }
  console.log(`✅ ${tournaments.length} tournament seeded (Weekly BR Match only — admin creates the rest)`);

  // Reviews
  const reviews = [
    { name: 'Rahul Kumar',    rating: 5, comment: 'Instant diamond delivery! Got my 520 diamonds within 30 seconds. Best FF top-up site in Pakistan.', avatarUrl: null },
    { name: 'Sarah Mitchell', rating: 5, comment: 'Won the weekly tournament and got my Rs. 7,500 prize within 24 hours. Legit platform!',             avatarUrl: null },
    { name: 'Arjun Patel',    rating: 5, comment: 'Customer support is amazing. Had an issue with my order and they resolved it in minutes.',          avatarUrl: null },
    { name: 'Maya Rodriguez', rating: 4, comment: 'Great prices on diamonds. Monthly membership pays for itself in 3 days.',                           avatarUrl: null },
    { name: 'Kevin Lee',      rating: 5, comment: 'Participated in 3 tournaments so far. The competition is fierce and rewards are real!',            avatarUrl: null },
    { name: 'Priya Sharma',   rating: 5, comment: 'Best Free Fire platform in 2026. EasyPaisa payments make it super convenient.',                     avatarUrl: null },
  ];
  for (const r of reviews) {
    await db.review.create({ data: { ...r, isActive: true } });
  }
  console.log(`✅ ${reviews.length} reviews seeded`);

  // Site settings — updated to match new homepage stats
  const settings = [
    { key: 'siteName',          value: 'Elite Gaming Hub' },
    { key: 'contactEmail',      value: 'support@elitegaming.com' },
    { key: 'discordUrl',        value: 'https://discord.gg/elitegaming' },
    { key: 'twitterUrl',        value: 'https://twitter.com/elitegaming' },
    { key: 'youtubeUrl',        value: 'https://youtube.com/@elitegaming' },
    { key: 'instagramUrl',      value: 'https://instagram.com/elitegaming' },
    // Homepage stats (updated to user's exact numbers)
    { key: 'totalPlayers',      value: '30' },
    { key: 'totalTournaments',  value: '1' },
    { key: 'diamondsDelivered', value: '40000' },
    { key: 'totalPrizePool',    value: '15000' },
    // EasyPaisa payment settings
    { key: 'easypaisaNumber',        value: '0312-4376721' },
    { key: 'easypaisaAccountName',   value: 'Elite Gaming Hub' },
    { key: 'paymentInstructions',    value: '1. Open your EasyPaisa app or dial *786#\n2. Send the exact amount to the EasyPaisa number shown above\n3. Note the Transaction ID from the confirmation SMS\n4. Take a clear screenshot of the payment confirmation\n5. Upload the screenshot and enter the Transaction ID below\n6. Submit — your order will be reviewed by admin within 1-24 hours' },
    // Referral reward config
    { key: 'referralRewardAmount',  value: '5' },
  ];
  for (const s of settings) {
    await db.siteSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }
  console.log(`✅ ${settings.length} site settings seeded (incl. EasyPaisa + referral config)`);

  // Demo coupon
  await db.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off your first order',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minAmount: 100,
      maxDiscount: 200,
      usageLimit: 1000,
      isActive: true,
    },
  });
  await db.coupon.upsert({
    where: { code: 'SAVE50' },
    update: {},
    create: {
      code: 'SAVE50',
      description: 'Rs. 50 off orders above Rs. 500',
      discountType: 'FIXED',
      discountValue: 50,
      minAmount: 500,
      isActive: true,
    },
  });
  console.log('✅ Demo coupons seeded (WELCOME10, SAVE50)');

  // Welcome notifications for demo user
  await db.notification.create({
    data: {
      userId: demo.id,
      type: 'GENERAL',
      title: 'Welcome to Elite Gaming Hub!',
      message: 'Thanks for joining! Use coupon WELCOME10 for 10% off your first diamond purchase. Pay easily with EasyPaisa. Share your referral code with friends to earn Rs.5 per signup+purchase!',
    },
  });

  console.log('\n🎉 Seeding complete!');
  console.log('Admin login: chuzixdp@gmail.com / Admin@12345');
  console.log('User login:  user@elitegaming.com / User@12345');
  console.log('EasyPaisa Number: 0312-4376721');
  console.log(`Admin referral code: ${admin.referralCode}`);
  console.log(`Demo  referral code: ${demo.referralCode}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
