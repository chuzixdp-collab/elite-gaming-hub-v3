import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  // Keep only 3 main tournaments
  const keepTitles = ['Daily Blaze Cup', 'Weekly Warfare Championship', 'Monthly Masters Championship'];
  await db.tournament.deleteMany({ where: { title: { notIn: keepTitles } } });
  const remaining = await db.tournament.findMany();
  console.log('Remaining tournaments:', remaining.map(t => t.title).join(', '));
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
