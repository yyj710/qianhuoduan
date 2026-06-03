import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { code: 429, message: '请求过于频繁', data: null, timestamp: Date.now() },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { code: 429, message: '请求过于频繁，请稍后再试', data: null, timestamp: Date.now() },
  standardHeaders: true,
  legacyHeaders: false,
});
