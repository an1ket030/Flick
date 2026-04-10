import type { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Always capture in Sentry
  Sentry.captureException(err, { extra: { url: req.url, method: req.method } });

  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500
    ? 'Something went wrong on our end. We\'ve been notified.'
    : err.message;

  console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.url}`, err.message);

  res.status(statusCode).json({
    data: null,
    error: {
      code: err.code ?? 'INTERNAL_ERROR',
      message,
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    data: null,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found.`,
    },
  });
}
