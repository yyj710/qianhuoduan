import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Classification {
  id: number;
  category: string;
  summary: string;
  eventDate?: string | null;
  eventLocation?: string | null;
  deadline?: string | null;
  status: string;
}

const classifications: Classification[] = [
  // ====== 无效数据，标记 discarded ======
  { id: 1, category: null as any, summary: '', status: 'discarded' }, // 导航页误抓

  // ====== 学术/教务类 ======
  { id: 3, category: 'academic', summary: '医学部生物医学工程学院转专业面试通知：6月10日8:30在丽湖校区A2-517进行',
    eventDate: '2026-06-10T08:30:00', eventLocation: '丽湖校区A2-517', status: 'published' },

  { id: 5, category: 'academic', summary: '金融科技学院2026秋季赴法国南特商学院交换生名单公示', status: 'published' },

  { id: 6, category: 'academic', summary: '教务部设立本科生实习突出问题投诉举报渠道，保障学生实习合法权益', status: 'published' },

  { id: 8, category: 'academic', summary: '管理学院"大数据管理与应用"本科专业申报专家论证会顺利召开', status: 'published' },

  { id: 23, category: 'academic', summary: '数学科学学院邀请西政、重庆文理学院开展中外合作办学专题交流', status: 'published' },

  // ====== 讲座/论坛 ======
  { id: 9, category: 'lecture', summary: '医学部"薪火计划"公开课：Python语言程序设计（数据分析Scipy），杨鹏老师主讲',
    eventDate: '2026-06-08T19:00:00', eventLocation: '守道楼', status: 'published' },

  { id: 14, category: 'lecture', summary: '人工智能学院周年学术周：IEEE荣誉班导师论坛第8期，促进师生学术交流', status: 'published' },

  { id: 20, category: 'lecture', summary: '人工智能学院周年学术周——青年科学家论坛，特邀英国阿伯丁大学等学者报告', status: 'published' },

  // ====== 考试/评教 ======
  { id: 11, category: 'exam', summary: '2025-2026学年第二学期研究生网上评教：6月5日至7月4日',
    deadline: '2026-07-04T23:59:00', status: 'published' },

  // ====== 比赛/竞赛 ======
  { id: 7, category: 'competition', summary: '深大学子在"正大杯"第十六届全国大学生市场调查与分析大赛总决赛斩获两项最高奖', status: 'published' },

  { id: 12, category: 'competition', summary: '教育部"双创领航精英训练营"招生，面向深港澳高校师生，含科创素养、创业技能培训', status: 'published' },

  { id: 29, category: 'competition', summary: '第三届粤港澳大湾区博士博士后创新创业大赛启动，5月底至10月底，决赛在东莞松山湖',
    eventDate: '2026-05-28T00:00:00', deadline: '2026-10-31T23:59:00', status: 'published' },

  { id: 40, category: 'competition', summary: '第三届"金思妙想"金融消保AIGC创新大赛来袭，深大全体同学可参加，有奖金+媒体曝光', status: 'published' },

  // ====== 奖学金/资助 ======
  { id: 35, category: 'scholarship', summary: '2026届困难家庭/特困/残疾/曾获助学贷款毕业生求职创业补贴申请，受理至6月26日',
    deadline: '2026-06-26T23:59:00', status: 'published' },

  { id: 38, category: 'scholarship', summary: '深圳大学2026届优秀毕业研究生拟获奖名单（第一批）公示', status: 'published' },

  // ====== 就业/招聘 ======
  { id: 33, category: 'recruitment', summary: '2026届毕业生就业进展情况通报（第9期），毕业去向落实率较上周提升3%', status: 'published' },

  { id: 41, category: 'recruitment', summary: '电信学院优秀退伍军人事迹报告暨征兵宣讲会圆满举行', status: 'published' },

  { id: 56, category: 'recruitment', summary: '丽湖校区党群服务中心补充招聘勤工助学岗位11名', status: 'published' },

  // ====== 校园活动 ======
  { id: 31, category: 'activity', summary: '管院师生产业参访走进前海，实地研学深圳出海e站通与1688选品中心', status: 'published' },

  { id: 32, category: 'activity', summary: '人文学院2026年"知行学堂"读书汇报大会在汇星楼二号报告厅举行', status: 'published' },

  { id: 34, category: 'activity', summary: '惟品学生社区管理委员会召开2026年第二次工作会议', status: 'published' },

  { id: 36, category: 'activity', summary: '物光学院举行"世界环境日"主题升旗仪式暨"强国复兴有我"党团日教育活动', status: 'published' },

  { id: 54, category: 'activity', summary: '体育学院举办深圳高校师生匹克球友谊赛，联动在深高校深化校际体育协作', status: 'published' },

  { id: 55, category: 'activity', summary: '5月曼陀罗绘画团体体验活动顺利举行，参与同学满意度9.5分', status: 'published' },

  { id: 58, category: 'activity', summary: '校医院联合深大总医院眼科在丽湖校区举行全国爱眼日义诊',
    eventDate: '2026-06-05T14:00:00', eventLocation: '丽湖校区', status: 'published' },

  { id: 59, category: 'activity', summary: 'Friday Global Meetup第三期：西班牙文化与饮食主题，与欧洲交换生面对面交流', status: 'published' },

  { id: 60, category: 'activity', summary: '传播学院"重走长征路"红色研学：寻访江西兴国将军故里，赓续苏区薪火', status: 'published' },

  { id: 61, category: 'activity', summary: '体育学院"活力深大·匹克新风"师生匹克球活动在粤海和丽湖校区圆满举办', status: 'published' },

  { id: 62, category: 'activity', summary: '百位深大校友萌娃欢聚荔园过六一，校友之家正式对外开放', status: 'published' },

  // ====== 科研成果/学术新闻 ======
  { id: 19, category: 'academic', summary: '医学部朱卫国教授团队在Molecular Cell发表PCBP1调控DNA损伤修复重要成果', status: 'published' },

  { id: 26, category: 'academic', summary: '全国科创500强发布，深大校友科创成果亮眼', status: 'published' },

  { id: 16, category: 'academic', summary: '我校获4项2026年度深圳市宣传文化基金项目资助', status: 'published' },

  // ====== 图书馆/资源 ======
  { id: 15, category: 'other', summary: '图书馆开通优质图书资源全民阅读服务平台试用，截止2026年9月30日',
    deadline: '2026-09-30T23:59:00', status: 'published' },

  // ====== discarded: 教师/行政相关，不面向学生 ======
  { id: 4, category: 'academic', summary: '', status: 'discarded' }, // 导师团队培育项目（教师申报）
  { id: 10, category: 'academic', summary: '', status: 'discarded' }, // 思政金课获奖（教师）
  { id: 13, category: 'academic', summary: '', status: 'discarded' }, // 省教育厅科研平台申报（教师）
  { id: 17, category: 'academic', summary: '', status: 'discarded' }, // 访问学者信息
  { id: 18, category: 'academic', summary: '', status: 'discarded' }, // 科技创新成果汇编（教师/科研）
  { id: 21, category: 'academic', summary: '', status: 'discarded' }, // 国家民委课题申报（教师）
  { id: 22, category: 'academic', summary: '', status: 'discarded' }, // 企业技术需求对接（教师/科研）
  { id: 24, category: 'academic', summary: '', status: 'discarded' }, // 招生政策培训会（教师）
  { id: 25, category: 'academic', summary: '', status: 'discarded' }, // 涉港澳台活动申报须知（行政）
  { id: 27, category: 'academic', summary: '', status: 'discarded' }, // 档案工作会议（行政）
  { id: 28, category: 'academic', summary: '', status: 'discarded' }, // 预算编报培训会（行政）
  { id: 30, category: 'academic', summary: '', status: 'discarded' }, // 档案管理职称评审（教师）
  { id: 37, category: 'academic', summary: '', status: 'discarded' }, // 就业工作推进会（行政）
  { id: 39, category: 'academic', summary: '', status: 'discarded' }, // 学情研判会（行政）
  { id: 42, category: 'academic', summary: '', status: 'discarded' }, // 辅导员沙龙（教师活动）

  // ====== discarded: 与学习生活无关 ======
  { id: 53, category: 'other', summary: '', status: 'discarded' }, // 暴雨天气提醒
  { id: 57, category: 'other', summary: '', status: 'discarded' }, // 宿舍临时停电

  // ====== 404 无效页面 ======
  { id: 43, category: null as any, summary: '', status: 'discarded' },
  { id: 44, category: null as any, summary: '', status: 'discarded' },
  { id: 45, category: null as any, summary: '', status: 'discarded' },
  { id: 46, category: null as any, summary: '', status: 'discarded' },
  { id: 47, category: null as any, summary: '', status: 'discarded' },
  { id: 48, category: null as any, summary: '', status: 'discarded' },
  { id: 49, category: null as any, summary: '', status: 'discarded' },
  { id: 50, category: null as any, summary: '', status: 'discarded' },
  { id: 51, category: null as any, summary: '', status: 'discarded' },
  { id: 52, category: null as any, summary: '', status: 'discarded' },
];

async function main() {
  let published = 0;
  let discarded = 0;

  for (const c of classifications) {
    const data: any = { status: c.status };
    if (c.status === 'published') {
      data.category = c.category;
      data.summary = c.summary;
      if (c.eventDate !== undefined) data.eventDate = c.eventDate ? new Date(c.eventDate) : null;
      if (c.eventLocation !== undefined) data.eventLocation = c.eventLocation;
      if (c.deadline !== undefined) data.deadline = c.deadline ? new Date(c.deadline) : null;
    }

    await prisma.announcement.update({ where: { id: c.id }, data });
    if (c.status === 'published') published++;
    else discarded++;
    console.log(`  [${c.status}] ID=${c.id} ${c.category || ''}`);
  }

  console.log(`\nDone: ${published} published, ${discarded} discarded`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
