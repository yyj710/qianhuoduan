import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/response.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Server Error:', err.message);
  fail(res, 500, '服务器内部错误');
}
