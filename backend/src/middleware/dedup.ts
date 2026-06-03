import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/response.js';

const requestCache = new Map<string, number>();

const WINDOW_MS = 5000;

export function dedupMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    next();
    return;
  }

  const requestId = req.headers['x-request-id'] as string;
  if (!requestId) {
    next();
    return;
  }

  const key = `${req.method}:${req.path}:${requestId}`;
  const now = Date.now();
  const lastTime = requestCache.get(key);

  if (lastTime && now - lastTime < WINDOW_MS) {
    fail(res, 429, '请勿重复提交');
    return;
  }

  requestCache.set(key, now);

  // Clean old entries periodically
  if (requestCache.size > 1000) {
    const cutoff = now - WINDOW_MS;
    for (const [k, v] of requestCache) {
      if (v < cutoff) requestCache.delete(k);
    }
  }

  next();
}
