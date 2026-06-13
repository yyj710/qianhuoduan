import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { dedupMiddleware } from './middleware/dedup.js';
import authRoutes from './routes/auth.routes.js';
import skillRoutes from './routes/skill.routes.js';
import demandRoutes from './routes/demand.routes.js';
import orderRoutes from './routes/order.routes.js';
import messageRoutes from './routes/message.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import bookmarkRoutes from './routes/bookmark.routes.js';
import followRoutes from './routes/follow.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// Serverless 环境下从 x-forwarded-for 获取真实 IP
app.set('trust proxy', 1);

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(generalLimiter);
app.use(dedupMiddleware);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/demands', demandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

export { app };
