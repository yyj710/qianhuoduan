import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tag-to-category mapping rules
const TAG_CATEGORY_MAP: Record<string, string> = {
  // academic_tutor
  '高数': 'academic_tutor', '线代': 'academic_tutor', '大物': 'academic_tutor', '大化': 'academic_tutor',
  '英语': 'academic_tutor', '四六级': 'academic_tutor', '考试': 'academic_tutor', '辅导': 'academic_tutor',
  '补课': 'academic_tutor', '绩点': 'academic_tutor', '学业': 'academic_tutor',
  // kaoyan
  '考研': 'kaoyan', '考公': 'kaoyan', '政治': 'kaoyan', '数学一': 'kaoyan',
  '数学二': 'kaoyan', '考研英语': 'kaoyan', '专业课': 'kaoyan', '复试': 'kaoyan',
  // career
  '简历': 'career', '面试': 'career', '实习': 'career', '求职': 'career',
  '工作': 'career', 'offer': 'career', '秋招': 'career', '春招': 'career',
  // thesis
  '论文': 'thesis', '写作': 'thesis', 'SCI': 'thesis', '毕设': 'thesis',
  '毕业论文': 'thesis', 'Word': 'thesis', 'LaTeX': 'thesis',
  // tech
  '编程': 'tech', 'Python': 'tech', 'Java': 'tech', 'C++': 'tech',
  '前端': 'tech', '后端': 'tech', '网站': 'tech', 'APP': 'tech',
  '小程序': 'tech', '数据': 'tech', '算法': 'tech', 'AI': 'tech',
  // lang
  '翻译': 'lang', '日语': 'lang', '韩语': 'lang', '法语': 'lang',
  '雅思': 'lang', '托福': 'lang',
  // secondhand
  '二手': 'secondhand', '转让': 'secondhand', '课本': 'secondhand',
  '电动车': 'secondhand', '自行车': 'secondhand',
  // life
  '代拿': 'life', '快递': 'life', '打印': 'life', '搬家': 'life',
  '清洁': 'life', '维修': 'life', '生活': 'life',
};

function inferCategory(tags: string[]): string {
  const scores: Record<string, number> = {};
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    for (const [keyword, category] of Object.entries(TAG_CATEGORY_MAP)) {
      if (lower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(lower)) {
        scores[category] = (scores[category] || 0) + 1;
      }
    }
  }
  let best = 'other';
  let bestScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) { best = cat; bestScore = score; }
  }
  return best;
}

async function main() {
  console.log('Starting category backfill...');

  // Backfill skills
  const skills = await prisma.skill.findMany({
    where: { category: { equals: null } },
  });
  console.log('Skills without category:', skills.length);

  for (const skill of skills) {
    const tags = JSON.parse(skill.tags || '[]') as string[];
    const category = inferCategory(tags);
    await prisma.skill.update({
      where: { id: skill.id },
      data: { category },
    });
    console.log('  Skill #' + skill.id + ' [' + skill.title + '] -> ' + category);
  }

  // Backfill demands
  const demands = await prisma.demand.findMany({
    where: { category: { equals: null } },
  });
  console.log('Demands without category:', demands.length);

  for (const demand of demands) {
    const tags = JSON.parse(demand.tags || '[]') as string[];
    const category = inferCategory(tags);
    await prisma.demand.update({
      where: { id: demand.id },
      data: { category },
    });
    console.log('  Demand #' + demand.id + ' [' + demand.title + '] -> ' + category);
  }

  console.log('Backfill complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());