import { Response } from 'express';

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export function success<T>(res: Response, data: T, message = 'success'): void {
  const body: ApiResponse<T> = {
    code: 200,
    message,
    data,
    timestamp: Date.now(),
  };
  res.json(body);
}

export function fail(res: Response, code: number, message: string, data: any = null): void {
  const body: ApiResponse = {
    code,
    message,
    data,
    timestamp: Date.now(),
  };
  res.status(code >= 500 ? 500 : code >= 400 ? code : 400).json(body);
}
