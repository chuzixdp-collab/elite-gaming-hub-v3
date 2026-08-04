import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const products = await db.product.findMany({ orderBy: { createdAt: 'asc' } });
  const seen = new Set();
  let deleted = 0;
  for (const p of products) {
    if (seen.has(p.name)) {
      await db.product.delete({ where: { id: p.id } });
      deleted++;
    } else seen.add(p.name);
  }
  console.log(`Deleted ${deleted} duplicate products`);
  const tourns = await db.tournament.findMany({ orderBy: { createdAt: 'asc' } });
  const tSeen = new Set();
  let tDeleted = 0;
  for (const t of tourns) {
    if (tSeen.has(t.title)) {
      await db.tournament.delete({ where: { id: t.id } });
      tDeleted++;
    } else tSeen.add(t.title);
  }
  console.log(`Deleted ${tDeleted} duplicate tournaments`);
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
