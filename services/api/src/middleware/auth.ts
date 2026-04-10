import type { Request, Response, NextFunction } from 'express';
import { createUserClient } from '../lib/supabase.js';

export interface AuthRequest extends Request {
  userId?: string;
  accessToken?: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header.' },
    });
    return;
  }

  const token = authHeader.slice(7);
  const client = createUserClient(token);
  const { data: { user }, error } = await client.auth.getUser();

  if (error || !user) {
    res.status(401).json({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session token.' },
    });
    return;
  }

  req.userId = user.id;
  req.accessToken = token;
  next();
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    req.accessToken = authHeader.slice(7);
  }
  next();
}
