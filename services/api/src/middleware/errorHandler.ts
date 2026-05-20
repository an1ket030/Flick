import type { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

/**
 * Custom error class for operational errors (4xx, known 5xx).
 * Thrown from route handlers via `throw new AppError('message', 400)`.
 */
export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    // Fix prototype chain for instanceof checks (required when extending built-ins)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error & { statusCode?: number; code?: string },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Always capture in Sentry
  Sentry.captureException(err, { extra: { url: req.url, method: req.method } });

  const statusCode = (err as any).statusCode ?? 500;
  const message = statusCode === 500
    ? 'Something went wrong on our end. We\'ve been notified.'
    : err.message;

  console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.url}`, err.message);

  res.status(statusCode).json({
    data: null,
    error: {
      code: (err as any).code ?? 'INTERNAL_ERROR',
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
