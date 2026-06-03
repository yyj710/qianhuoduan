import bcrypt from 'bcryptjs';
import prisma from './config/prisma.js';

async function seed() {
  console.log('开始填充测试数据...');

  // 清理旧数据
  await prisma.message.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.demand.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('test1234', 12);

  // ========== 创建用户 ==========
  const users = await Promise.all([
    prisma.user.create({ data: { username: '计算机小王', password, phone: '13800001001', college: '计算机与软件学院', campus: '粤海校区', creditScore: 4.8, onlineStatus: 1, lastActiveTime: new Date() } }),
    prisma.user.create({ data: { username: '设计小李', password, phone: '13800001002', college: '艺术学部', campus: '粤海校区', creditScore: 4.5, onlineStatus: 1, lastActiveTime: new Date() } }),
    prisma.user.create({ data: { username: '英语小张', password, phone: '13800001003', college: '外国语学院', campus: '丽湖校区', creditScore: 4.9, onlineStatus: 1, lastActiveTime: new Date() } }),
    prisma.user.create({ data: { username: '数学小陈', password, phone: '13800001004', college: '数学与统计学院', campus: '沧海校区', creditScore: 4.2, onlineStatus: 0, lastActiveTime: new Date(Date.now() - 40 * 60000) } }),
    prisma.user.create({ data: { username: '摄影小赵', password, phone: '13800001005', college: '传播学院', campus: '沧海校区', creditScore: 3.8, onlineStatus: 1, lastActiveTime: new Date() } }),
    prisma.user.create({ data: { username: '经管小刘', password, phone: '13800001006', college: '经济学院', campus: '丽湖校区', creditScore: 4.6, onlineStatus: 0, lastActiveTime: new Date(Date.now() - 150 * 60000) } }),
  ]);

  console.log(`创建了 ${users.length} 个用户`);

  // ========== 创建技能 ==========
  const skills = await Promise.all([
    prisma.skill.create({ data: { userId: users[0].id, title: 'Python编程一对一辅导', tags: JSON.stringify(['Python', '编程', '辅导']), description: '计算机学院研究生，擅长Python基础与进阶教学，可辅导期末作业、课程设计等。有2年教学经验。', price: 60, deliveryTime: '1天', campus: '粤海校区', dealCount: 12, viewCount: 230 } }),
    prisma.skill.create({ data: { userId: users[0].id, title: 'Java/SpringBoot后端开发指导', tags: JSON.stringify(['Java', 'SpringBoot', '后端']), description: '熟悉SpringBoot框架，可以帮你理解后端开发流程，完成课程项目。', price: 80, deliveryTime: '2天', campus: '粤海校区', dealCount: 8, viewCount: 156 } }),
    prisma.skill.create({ data: { userId: users[1].id, title: 'UI设计/海报制作', tags: JSON.stringify(['设计', 'UI', '海报', 'Figma']), description: '艺术学部大三，熟练使用Figma/PS，可做APP界面设计、海报、宣传物料。', price: 50, deliveryTime: '1天', campus: '不限', dealCount: 20, viewCount: 420 } }),
    prisma.skill.create({ data: { userId: users[1].id, title: 'PPT美化与答辩设计', tags: JSON.stringify(['PPT', '设计', '答辩']), description: '帮你把PPT做得好看又专业，在答辩中脱颖而出。包含动画和排版优化。', price: 30, deliveryTime: '当日', campus: '不限', dealCount: 35, viewCount: 680 } }),
    prisma.skill.create({ data: { userId: users[2].id, title: '英语四六级考前辅导', tags: JSON.stringify(['英语', '四六级', '考试']), description: '英语专业八级，六级650+，提供听说读写全方位辅导，有独家资料。', price: 55, deliveryTime: '2天', campus: '丽湖校区', dealCount: 15, viewCount: 310 } }),
    prisma.skill.create({ data: { userId: users[2].id, title: '留学文书润色/翻译', tags: JSON.stringify(['英语', '留学', '文书', '翻译']), description: '帮你润色留学PS/CV，也可做中英文互译。质量保证。', price: 70, deliveryTime: '3天', campus: '不限', dealCount: 6, viewCount: 145 } }),
    prisma.skill.create({ data: { userId: users[3].id, title: '高等数学/线性代数辅导', tags: JSON.stringify(['数学', '高数', '线代', '辅导']), description: '数学系研究生，可辅导高数、线代、概率论等课程。帮你理解概念、解题技巧。', price: 50, deliveryTime: '1天', campus: '沧海校区', dealCount: 18, viewCount: 290 } }),
    prisma.skill.create({ data: { userId: users[4].id, title: '校园写真/毕业照拍摄', tags: JSON.stringify(['摄影', '写真', '毕业照']), description: '自备佳能全画幅相机，擅长校园风格写真。提供精修10张，底片全送。', price: 88, deliveryTime: '3天', campus: '不限', dealCount: 25, viewCount: 560 } }),
    prisma.skill.create({ data: { userId: users[4].id, title: '视频剪辑/短视频制作', tags: JSON.stringify(['视频', '剪辑', 'PR', '短视频']), description: '会用PR和剪映，帮你剪辑活动视频、vlog、短视频等。含字幕和简单特效。', price: 65, deliveryTime: '2天', campus: '沧海校区', dealCount: 10, viewCount: 200 } }),
    prisma.skill.create({ data: { userId: users[5].id, title: '数据分析/SPSS/Excel', tags: JSON.stringify(['数据分析', 'SPSS', 'Excel']), description: '经管类专业，熟悉问卷分析、数据可视化，帮你搞定实证分析。', price: 45, deliveryTime: '2天', campus: '丽湖校区', dealCount: 10, viewCount: 0 } }),
  ]);

  console.log(`创建了 ${skills.length} 个技能`);

  // ========== 创建需求 ==========
  const demands = await Promise.all([
    prisma.demand.create({ data: { userId: users[3].id, title: '急需Python大作业辅导', tags: JSON.stringify(['Python', '编程', '辅导']), description: '计算机基础课的期末大作业，需要做一个爬虫+数据分析的项目，希望有人指导完成。', budget: 100, deadline: '2026-06-15', campus: '沧海校区', matchCount: 2 } }),
    prisma.demand.create({ data: { userId: users[0].id, title: '软件工程课设UI设计', tags: JSON.stringify(['设计', 'UI', 'Figma']), description: '课设做个校园小程序，后端都写好了，需要一个好看的UI设计，最好用Figma。', budget: 80, deadline: '2026-06-20', campus: '粤海校区', matchCount: 1 } }),
    prisma.demand.create({ data: { userId: users[5].id, title: '英语口语陪练', tags: JSON.stringify(['英语', '口语', '雅思']), description: '准备雅思口语考试，希望找一位英语好的同学每周练习2次，每次1小时。', budget: 60, deadline: '2026-06-10', campus: '不限', matchCount: 1 } }),
    prisma.demand.create({ data: { userId: users[1].id, title: '求帮忙拍社团宣传照', tags: JSON.stringify(['摄影', '宣传']), description: '社团换届需要拍一组宣传照，10人左右，希望在校园内拍摄。', budget: 120, deadline: '2026-06-12', campus: '粤海校区', matchCount: 1 } }),
    prisma.demand.create({ data: { userId: users[2].id, title: '找人帮忙调SPSS数据分析', tags: JSON.stringify(['数据分析', 'SPSS']), description: '毕业论文需要做问卷分析，不太会用SPSS，求指导。', budget: 50, deadline: '2026-06-18', campus: '丽湖校区', matchCount: 0 } }),
    prisma.demand.create({ data: { userId: users[4].id, title: '求高数期末冲刺辅导', tags: JSON.stringify(['数学', '高数', '考试']), description: '高数下快考试了，重点辅导多重积分和曲线曲面积分。最好是线下面对面。', budget: 90, deadline: '2026-06-08', campus: '沧海校区', matchCount: 1, status: 1 } }),
  ]);

  console.log(`创建了 ${demands.length} 个需求`);

  // ========== 创建订单 ==========
  const orders = await Promise.all([
    // 已完成订单
    prisma.order.create({ data: { orderNo: 'SC202606010001', buyerId: users[3].id, sellerId: users[0].id, skillId: skills[0].id, amount: 60, status: 3, confirmTime: new Date('2026-06-01'), completeTime: new Date('2026-06-02') } }),
    prisma.order.create({ data: { orderNo: 'SC202606010002', buyerId: users[5].id, sellerId: users[1].id, skillId: skills[2].id, amount: 50, status: 3, confirmTime: new Date('2026-06-01'), completeTime: new Date('2026-06-02') } }),
    // 进行中订单
    prisma.order.create({ data: { orderNo: 'SC202606020001', buyerId: users[3].id, sellerId: users[2].id, skillId: skills[4].id, amount: 55, status: 1, confirmTime: new Date('2026-06-02') } }),
    // 待评价订单
    prisma.order.create({ data: { orderNo: 'SC202606020002', buyerId: users[4].id, sellerId: users[0].id, skillId: skills[0].id, amount: 60, status: 2, confirmTime: new Date('2026-06-01'), completeTime: new Date('2026-06-02') } }),
    // 待确认订单
    prisma.order.create({ data: { orderNo: 'SC202606020003', buyerId: users[5].id, sellerId: users[4].id, skillId: skills[8].id, amount: 65, status: 0 } }),
    // 已取消订单
    prisma.order.create({ data: { orderNo: 'SC202606020004', buyerId: users[1].id, sellerId: users[2].id, skillId: skills[5].id, amount: 70, status: 4 } }),
  ]);

  console.log(`创建了 ${orders.length} 个订单`);

  // ========== 创建评价 ==========
  await Promise.all([
    prisma.comment.create({ data: { userId: users[3].id, targetId: users[0].id, orderId: orders[0].id, type: 'buyer_to_seller', score: 5, content: '小王讲得非常清楚，Python基础不好的我也能听懂，大作业顺利过关！' } }),
    prisma.comment.create({ data: { userId: users[0].id, targetId: users[3].id, orderId: orders[0].id, type: 'seller_to_buyer', score: 5, content: '沟通很顺畅，需求表达清楚，很好的买家。' } }),
    prisma.comment.create({ data: { userId: users[5].id, targetId: users[1].id, orderId: orders[1].id, type: 'buyer_to_seller', score: 4, content: '设计风格很符合需求，改了两版就定稿了，效率高。' } }),
    prisma.comment.create({ data: { userId: users[1].id, targetId: users[5].id, orderId: orders[1].id, type: 'seller_to_buyer', score: 5, content: '需求明确，反馈及时，合作愉快！' } }),
  ]);

  console.log('创建了评价记录');

  // ========== 创建消息 ==========
  const now = Date.now();
  await Promise.all([
    // 小王和小陈的对话
    prisma.message.create({ data: { senderId: users[3].id, receiverId: users[0].id, content: '你好，请问Python辅导可以线下吗？', readStatus: 1, createTime: new Date(now - 3600000) } }),
    prisma.message.create({ data: { senderId: users[0].id, receiverId: users[3].id, content: '可以的！我在粤海校区图书馆，你呢？', readStatus: 1, createTime: new Date(now - 3500000) } }),
    prisma.message.create({ data: { senderId: users[3].id, receiverId: users[0].id, content: '我在沧海校区，周末可以去粤海找你', readStatus: 1, createTime: new Date(now - 3400000) } }),
    prisma.message.create({ data: { senderId: users[0].id, receiverId: users[3].id, content: '好的，那我们周六下午2点图书馆见！', readStatus: 0, createTime: new Date(now - 600000) } }),
    // 小刘和小李
    prisma.message.create({ data: { senderId: users[5].id, receiverId: users[1].id, content: '你好，我想要一个简约风格的APP UI', readStatus: 1, createTime: new Date(now - 7200000) } }),
    prisma.message.create({ data: { senderId: users[1].id, receiverId: users[5].id, content: '没问题，你可以发一下参考图，我看看你喜欢什么风格', readStatus: 1, createTime: new Date(now - 7100000) } }),
    prisma.message.create({ data: { senderId: users[5].id, receiverId: users[1].id, content: '好的，我整理一下发给你', readStatus: 1, createTime: new Date(now - 7000000) } }),
    prisma.message.create({ data: { senderId: users[1].id, receiverId: users[5].id, content: '好的等你，我先了解一下你的功能需求', readStatus: 0, createTime: new Date(now - 1200000) } }),
    // 小赵给小王发消息
    prisma.message.create({ data: { senderId: users[4].id, receiverId: users[0].id, content: '你好，看到你的Python辅导，请问可以教爬虫吗？', readStatus: 0, createTime: new Date(now - 300000) } }),
    // 系统消息（用admin用户ID发送）
    prisma.message.create({ data: { senderId: users[0].id, receiverId: users[0].id, type: 'system', content: '🎉 系统通知：你的技能「Python编程一对一辅导」已完成第10单，信用分提升至4.8', readStatus: 1, createTime: new Date(now - 86400000) } }),
  ]);

  console.log('创建了消息记录');
  console.log('\n✅ 测试数据填充完成！');
  console.log('\n--- 测试账号 ---');
  console.log('用户名: 计算机小王  | 密码: test1234 | 校区: 粤海 | 有2个技能(热门)');
  console.log('用户名: 设计小李    | 密码: test1234 | 校区: 粤海 | PPT/UI设计');
  console.log('用户名: 英语小张    | 密码: test1234 | 校区: 丽湖 | 英语辅导/文书');
  console.log('用户名: 数学小陈    | 密码: test1234 | 校区: 沧海 | 高数辅导');
  console.log('用户名: 摄影小赵    | 密码: test1234 | 校区: 沧海 | 摄影/视频');
  console.log('用户名: 经管小刘    | 密码: test1234 | 校区: 丽湖 | 数据分析');
  console.log('\n所有用户密码统一为: test1234');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
