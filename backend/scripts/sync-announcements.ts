import https from 'https';
import http from 'http';
import crypto from 'crypto';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USERNAME = process.env.SZU_USERNAME || '500309';
const PASSWORD = process.env.SZU_PASSWORD || '290193';
const BASE = 'https://www1.szu.edu.cn';
const CAS = 'https://authserver.szu.edu.cn';
const PAGE_SIZE = 3; // Number of board pages to scrape

// ====== Encryption utilities (matching encrypt.js) ======

function randomString(length: number): string {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function encryptPassword(password: string, salt: string): string {
  const plaintext = randomString(64) + password;
  const iv = randomString(16);
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(salt, 'utf8'), Buffer.from(iv, 'utf8'));
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

// ====== HTTP utilities ======

function resolveUrl(base: string, path: string | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const u = new URL(base);
  if (path.startsWith('/')) return `${u.protocol}//${u.host}${path}`;
  return `${u.protocol}//${u.host}/${path}`;
}

interface FetchResult {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  cookies: string[];
  body: Buffer;
  finalUrl: string;
}

function fetch(url: string, baseUrl: string, opts: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
} = {}): Promise<FetchResult> {
  const fullUrl = resolveUrl(baseUrl, url) || url;
  return new Promise((resolve, reject) => {
    const u = new URL(fullUrl);
    const isHttps = u.protocol === 'https:';
    const mod = isHttps ? https : http;
    const req = mod.request({
      hostname: u.hostname,
      port: u.port || (isHttps ? 443 : 80),
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        ...opts.headers,
      },
      rejectUnauthorized: false,
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const setCookies = (res.headers['set-cookie'] || []).map((c: string) => c.split(';')[0]);
        resolve({
          status: res.statusCode || 0,
          headers: res.headers as Record<string, string | string[] | undefined>,
          cookies: setCookies,
          body: buf,
          finalUrl: fullUrl,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')); });
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

// ====== CAS Login ======

async function casLogin(): Promise<string[]> {
  const jar: string[] = [];

  let r = await fetch(BASE + '/', '');
  jar.push(...r.cookies);

  let loc: string | null = r.headers['location'] as string || null;
  let lastBase = BASE;
  while (loc) {
    const nextUrl = resolveUrl(lastBase, loc)!;
    r = await fetch(nextUrl, '');
    jar.push(...r.cookies);
    if (nextUrl.includes('authserver')) lastBase = CAS;
    else if (nextUrl.includes('www1.szu.edu.cn')) lastBase = BASE;
    loc = r.headers['location'] as string || null;
    if (r.status === 200 && r.body.length > 1000 && !loc) break;
  }

  // Extract execution token and encryption salt
  const bodyStr = r.body.toString('binary');
  const execMatch = bodyStr.match(/name="execution"\s+value="([^"]+)"/);
  const saltMatch = bodyStr.match(/id="pwdEncryptSalt"\s+value="([^"]+)"/);
  if (!execMatch) throw new Error('Could not find CAS execution token');

  const encPwd = encryptPassword(PASSWORD, saltMatch ? saltMatch[1] : 'bxMGkR74nkEn0Wdo');
  const params = new URLSearchParams();
  params.append('username', USERNAME);
  params.append('password', encPwd);
  params.append('execution', execMatch[1]);
  params.append('_eventId', 'submit');
  params.append('dllt', 'generalLogin');
  params.append('cllt', 'generalLogin');
  params.append('rememberMe', 'true');

  r = await fetch(CAS + '/authserver/login', CAS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: jar.join('; ') },
    body: params.toString(),
  });
  jar.push(...r.cookies);

  // Follow post-login redirects
  loc = r.headers['location'] as string || null;
  lastBase = CAS;
  while (loc) {
    const nextUrl = resolveUrl(lastBase, loc)!;
    r = await fetch(nextUrl, lastBase, { headers: { Cookie: jar.join('; ') } });
    jar.push(...r.cookies);
    if (nextUrl.includes('authserver')) lastBase = CAS;
    else if (nextUrl.includes('www1.szu.edu.cn')) lastBase = BASE;
    loc = r.headers['location'] as string || null;
  }

  console.log(`  ✅ CAS login successful (${r.body.length} bytes)`);
  return jar;
}

// ====== Board scraping ======

interface RawAnnouncement {
  sourceId: string;
  title: string;
  sourceUrl: string;
  publishDate: string; // Raw date string from page
  sourceDept: string;
}

async function scrapeBoardList(jar: string[]): Promise<RawAnnouncement[]> {
  const items: RawAnnouncement[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= PAGE_SIZE; page++) {
    // Board page uses infolist.asp for pagination with day parameter
    const url = page === 1
      ? BASE + '/board/'
      : BASE + `/board/index.jsp?page=${page}`;

    console.log(`  📄 Scraping ${url}`);
    const r = await fetch(url, BASE, { headers: { Cookie: jar.join('; ') } });
    const decoded = iconv.decode(r.body, 'gb2312');
    const $ = cheerio.load(decoded);

    // Find all announcement links: view.asp?id=XXXXXX where id > 10000 (real announcements,
    // navigation links like 教师事务/学生事务 have small IDs like 12/13)
    $('a[href*="view.asp?id="]').each((_, a) => {
      const href = $(a).attr('href') || '';
      const idMatch = href.match(/id=(\d+)/);
      if (!idMatch) return;

      const id = parseInt(idMatch[1], 10);
      // Filter: real announcements have 5-6 digit IDs, navigation links have 2-3 digits
      if (id < 10000) return;
      if (seen.has(idMatch[1])) return;
      seen.add(idMatch[1]);

      const title = $(a).text().trim();
      if (!title || title.length < 3) return;

      // Try to find date and department from the parent table row
      // The board page structure: each announcement is in a nested table row
      // with date and department in adjacent cells
      const parentRow = $(a).closest('tr');
      const rowText = parentRow.text().trim();

      // Extract date: MM/DD format
      const dateMatch = rowText.match(/(\d{1,2})\/(\d{1,2})/);

      // Extract department: look for text between date and the title,
      // or in a <font> tag (department is often styled)
      let dept = '';
      const fontTags = parentRow.find('font');
      fontTags.each((_, f) => {
        const t = $(f).text().trim();
        if (t && t !== title && t.length >= 2 && !/^\d/.test(t)
            && !t.includes('首页') && !t.includes('公文通') && !t.includes('/')) {
          if (!dept) dept = t;
        }
      });

      // Also try extracting from all cells
      if (!dept) {
        parentRow.find('td').each((_, td) => {
          const t = $(td).text().trim();
          if (t && t !== title && t.length >= 2 && t.length <= 20
              && !/^\d/.test(t) && !t.includes('首页') && !t.includes('公文通')
              && !t.includes('校园') && !t.includes('/')) {
            if (!dept) dept = t;
          }
        });
      }

      items.push({
        sourceId: idMatch[1],
        title,
        sourceUrl: `${BASE}/board/${href}`,
        publishDate: dateMatch ? `${dateMatch[1]}/${dateMatch[2]}` : '',
        sourceDept: dept,
      });
    });

    if (items.length === 0) break;
  }

  console.log(`  📋 Found ${items.length} announcements (${PAGE_SIZE} pages)`);
  return items;
}

// ====== Detail page scraping ======

async function scrapeDetail(jar: string[], sourceUrl: string): Promise<{
  content: string;
  publishDate: Date | null;
  sourceDept: string;
}> {
  const r = await fetch(sourceUrl, BASE, { headers: { Cookie: jar.join('; ') } });
  const decoded = iconv.decode(r.body, 'gb2312');

  // Strip HTML tags for content
  const content = decoded
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  // Extract publish date and department from the detail page
  // The raw HTML contains: <font color=#808080>医学部</font>　2026/6/5 17:28:00
  // Strip HTML first, then match: "医学部　2026/6/5 17:28:00"
  const plainText = decoded.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  const metaMatch = plainText.match(/(\S+)\s+(\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}:\d{2})/);
  let publishDate: Date | null = null;
  let sourceDept = '';

  if (metaMatch) {
    sourceDept = metaMatch[1].replace(/^.*>/, '').trim(); // Clean any residual HTML attribute
    publishDate = new Date(metaMatch[2]);
  } else {
    // Fallback: try to find any date
    const dateMatch = plainText.match(/(\d{4}\/\d{1,2}\/\d{1,2})/);
    if (dateMatch) publishDate = new Date(dateMatch[1]);
  }

  return { content, publishDate, sourceDept };
}

// ====== Main ======

async function main() {
  console.log('🔧 深大公文通同步脚本');
  console.log(`⏰ ${new Date().toLocaleString()}\n`);

  // 1. Login
  console.log('1️⃣ CAS 登录中...');
  const jar = await casLogin();

  // 2. Scrape board list
  console.log('\n2️⃣ 爬取公文通列表...');
  const items = await scrapeBoardList(jar);

  // 3. Check existing IDs
  const existingIds = new Set(
    (await prisma.announcement.findMany({
      select: { sourceId: true },
      where: { sourceId: { in: items.map(i => i.sourceId) } },
    })).map(a => a.sourceId)
  );

  const newItems = items.filter(i => !existingIds.has(i.sourceId));
  console.log(`\n3️⃣ 去重：${items.length} 条总数，${existingIds.size} 条已存在，${newItems.length} 条新公告`);

  if (newItems.length === 0) {
    console.log('   ✅ 无新公告，结束');
    await prisma.$disconnect();
    return;
  }

  // 4. Fetch detail pages for new items
  console.log('\n4️⃣ 获取详情页...');
  const announcements: Array<{
    sourceId: string;
    title: string;
    content: string | null;
    publishDate: Date | null;
    sourceUrl: string;
    sourceDept: string;
  }> = [];

  for (let i = 0; i < newItems.length; i++) {
    const item = newItems[i];
    try {
      const detail = await scrapeDetail(jar, item.sourceUrl);
      announcements.push({
        sourceId: item.sourceId,
        title: item.title,
        content: detail.content,
        publishDate: detail.publishDate || null,
        sourceUrl: item.sourceUrl,
        sourceDept: detail.sourceDept || item.sourceDept,
      });
      console.log(`   [${i + 1}/${newItems.length}] ${item.title.substring(0, 60)}`);
    } catch (err) {
      console.log(`   [${i + 1}/${newItems.length}] ❌ ${item.title.substring(0, 40)}: ${err}`);
    }
    // Delay between detail pages
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 5. Save to database
  console.log(`\n5️⃣ 写入数据库 (${announcements.length} 条)...`);
  for (const a of announcements) {
    await prisma.announcement.upsert({
      where: { sourceId: a.sourceId },
      create: {
        sourceId: a.sourceId,
        title: a.title,
        content: a.content,
        publishDate: a.publishDate,
        sourceUrl: a.sourceUrl,
        sourceDept: a.sourceDept,
        status: 'pending',
      },
      update: {
        // Update title/content if changed (e.g. announcement was updated)
        title: a.title,
        content: a.content,
      },
    });
  }

  // 6. Clean old data
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const deleted = await prisma.announcement.deleteMany({
    where: { createdAt: { lt: thirtyDaysAgo } },
  });
  if (deleted.count > 0) {
    console.log(`\n🧹 清理 ${deleted.count} 条 30 天前的旧公告`);
  }

  console.log(`\n✅ 完成！新增 ${announcements.length} 条公告 (status=pending)`);
  console.log(`   下次 AI 分析后将自动分类并展示给用户\n`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('❌ 同步失败:', err);
  await prisma.$disconnect();
  process.exit(1);
});
