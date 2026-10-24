# ShenJiLian · Zero-Commission Skill-Sharing Platform for Shenzhen University

> **中文版本 → [README.zh-CN.md](./README.zh-CN.md)**
>
> **Live site**: https://chuangying3.netlify.app (register to explore)
> From zero to deployed full-stack app: one person, one laptop, AI-assisted coding, 2 weeks.

![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Node.js](https://img.shields.io/badge/Node.js-20-339933)
![Express](https://img.shields.io/badge/Express-4-000000)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)

## What this is

Shenzhen University students have fragmented skills (PPT design, video editing, translation, coding) going to waste, while small urgent requests go unanswered. Off-campus platforms charge 15-20% commission; campus QQ groups are chaotic with no matching.

This platform fills the gap with **zero commission + verified campus identity + algorithmic matching + aggregated campus announcements**.

## How I built it

Started from zero. On June 2 I knew nothing about web dev; on June 3 the first deploy went live; then iterated through June 13:

1. **Docs before code** — project plan V3.2 → full PRD (page topology / permissions / state machines) → implementation docs, all version-managed
2. **AI-assisted coding** — I owned product definition, tech selection and acceptance testing; Claude wrote the implementation; every key decision was logged
3. **No entity without necessity** — every feature had to answer "whose problem does this solve?" (the payment module was cut this way)

## Three hardest problems

| Problem | Symptom | Fix |
|---------|---------|-----|
| University CAS SSO encryption | Campus notice crawler couldn't log in; passwords sent as AES-128-CBC ciphertext | Reverse-engineered the encryption from browser network traces, reproduced it with Node `crypto` |
| GB2312 encoding garbled text | Crawled announcements were unreadable | `iconv-lite`: fetch raw Buffer first, then convert to UTF-8 — the longest debugging session |
| Keyword matching failed | A request tagged "Python" vs a skill tagged "programming" scored 0 | Dropped keywords; 5-dimension weighted scoring: tags 40% + category 20% + credit 15% + campus 15% + online 10% |

## Key trade-offs

- **Polling vs WebSocket**: Netlify Functions are stateless (no persistent connections); 5-second polling costs 1/10 the effort and latency is acceptable at MVP scale
- **Neon PostgreSQL + Netlify free tier**: zero recurring cost for a personal project; same-origin frontend/backend means no CORS
- **No payment module**: zero-commission means the platform never touches money — simpler and safer

## Core features

Skill marketplace · Demand hall (publishing triggers matching, Top-3 recommendations) · Order state machine (pending → active → to-review → completed/cancelled) · WeChat-style private messaging · Two-way rating & credit system · Campus notice crawler with auto-classification · Favorites / follows / notifications

## Architecture

```
Browser (React 18 + Ant Design 5 + Redux Toolkit + Vite)
   ↓ Axios (JWT / request dedup / auto-redirect on 401)
Netlify Function (Express + TypeScript, esbuild + serverless-http)
   ├─ controllers → services → Prisma ORM
   ├─ middleware: JWT auth / 5-req-per-min rate limit / idempotency dedup
   ↓
Neon PostgreSQL (9 tables: users/skills/demands/orders/reviews/messages/favorites/follows/announcements)
```

## Result

- Live and accessible (link at top)
- 10 feature modules, 9 database tables, complete transaction loop (register → publish → match → order → review)
- Byproducts: [business plan V3.2](./项目计划书_技能零废弃.md), [full PRD](./技能集_PRD产品需求文档.docx)

## Run locally

```bash
cd backend && npm install && npx prisma migrate dev && npm run dev   # :3001
cd frontend && npm install && npm run dev                            # :5173
```
