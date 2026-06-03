import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { errorHandler } from './middleware/error.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { dedupMiddleware } from './middleware/dedup.js';
import authRoutes from './routes/auth.routes.js';
import skillRoutes from './routes/skill.routes.js';
import demandRoutes from './routes/demand.routes.js';
import orderRoutes from './routes/order.routes.js';
import messageRoutes from './routes/message.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// CORS：开发环境允许 Vite 跨域访问
if (!isProduction) {
  app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }));
}

app.use(express.json());
app.use(generalLimiter);
app.use(dedupMiddleware);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/demands', demandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', authRoutes);

// 生产环境：serve 前端静态文件（前后端合一，无需 Vercel）
if (isProduction) {
  const publicDir = path.join(__dirname, 'public');
  if (existsSync(publicDir)) {
    app.use(express.static(publicDir));
    // SPA fallback：所有非 API 路径都返回 index.html
    app.get('*', (_req, res) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
    console.log('Serving frontend from', publicDir);
  } else {
    console.log('No public directory found, running API-only mode');
  }
}

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}, mode: ${isProduction ? 'production' : 'development'}`);
});
