import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const list = await p.announcement.findMany({ where: { status: 'pending' }, orderBy: { id: 'asc' } });
  console.log('Pending count:', list.length);
  for (const a of list) {
    console.log(`[${a.id}] ${a.sourceId} | ${a.title.substring(0, 80)}`);
  }
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
