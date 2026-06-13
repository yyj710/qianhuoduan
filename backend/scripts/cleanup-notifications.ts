import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await prisma.notification.deleteMany({
    where: {
      readStatus: 1,
      createTime: { lt: thirtyDaysAgo },
    },
  });

  console.log('Cleaned up ' + result.count + ' old read notifications');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());