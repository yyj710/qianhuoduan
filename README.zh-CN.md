# 深技联 · 深圳大学 0 佣金技能互助平台

> **English version → [README.md](./README.md)**
>
> **在线体验**：https://chuangying3.netlify.app （零费skill，注册即可用）
> 从 0 基础到全栈上线：一个人，一台电脑，AI 协作编程，全程 2 周。

![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Node.js](https://img.shields.io/badge/Node.js-20-339933)
![Express](https://img.shields.io/badge/Express-4-000000)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)

## 这是什么

深大学生有大量碎片化技能（PPT 美化、剪辑、翻译、编程）被闲置，同时存在大量小额急单需求。
校外平台抽成 15-20%，校内 QQ 群/表白墙信息杂乱无匹配。
深技联用 **0 佣金 + 校园实名 + 算法匹配 + 公文通公告聚合** 填补这个空白。

## 我怎么做出来的

完全从零起步。6月2日我还不懂前后端，6月3日首轮部署成功，之后边学边迭代到 6月13日：

1. **先写文档再写代码** — 项目计划书 V3.2 → PRD（页面拓扑/权限/状态机）→ 实现文档，全程版本管理
2. **AI 协作编程** — 我负责产品定义、技术选型和验收，Claude 负责实现，每次对话要点留痕成文档
3. **如无必要勿增实体** — 每个功能先问"解决了谁的什么问题"，答不上来就砍（支付模块就是这么砍掉的）

## 遇到的三个坎

| 坎 | 现象 | 解法 |
|---|------|------|
| 学校 CAS 统一认证加密 | 公文通爬虫登录不了，密码是 AES-128-CBC 加密传输的 | 浏览器抓包逆向出加密逻辑，用 Node `crypto` 复现同样的加密 |
| GB2312 编码乱码 | 爬回来的公告全是乱码 | `iconv-lite` 先拿原始 Buffer 再转 UTF-8，卡了最久的一个坑 |
| 关键词匹配失效 | 需求标"Python"、技能标"编程"，匹配得 0 分 | 放弃关键词，改为五维加权评分：标签40% + 分类20% + 信用15% + 校区15% + 在线10% |

## 关键取舍

- **轮询 vs WebSocket**：Netlify Function 无状态不支持长连接，5 秒轮询实现成本 1/10，MVP 规模下延迟可接受
- **Neon PostgreSQL + Netlify 免费额度**：个人项目零持续成本，前后端同域天然免跨域
- **不做支付**：0 佣金模式下平台不碰资金，用户私下交易，反而更简单更安全

## 核心功能

技能广场 · 需求大厅（发布即触发匹配，推荐 Top3）· 订单状态机（待确认→进行中→待评价→已完成/已取消）· 私聊（类微信交互）· 双向评价信用体系 · 校园公告爬虫+自动分类 · 收藏/关注/通知

## 技术架构

```
浏览器 (React 18 + Ant Design 5 + Redux Toolkit + Vite)
   ↓ Axios（JWT / 请求去重 / 401 自动跳转）
Netlify Function (Express + TypeScript，esbuild 打包 + serverless-http)
   ├─ controllers → services → Prisma ORM
   ├─ middleware: JWT 认证 / 5次每分钟限流 / 幂等去重
   ↓
Neon PostgreSQL（9 张表：用户/技能/需求/订单/评价/消息/收藏/关注/公告）
```

## 结果

- 网站上线并可正常访问（见顶部链接）
- 10 个功能模块、9 张数据表、完整交易闭环（注册→发布→匹配→下单→互评）
- 附带产物：[项目计划书 V3.2](./项目计划书_技能零废弃.md)（市场分析+竞品对比）、[PRD 产品需求文档](./技能集_PRD产品需求文档.docx)

## 本地运行

```bash
cd backend && npm install && npx prisma migrate dev && npm run dev   # :3001
cd frontend && npm install && npm run dev                            # :5173
```
