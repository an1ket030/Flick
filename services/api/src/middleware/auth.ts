import type { Request, Response, NextFunction } from 'express';
import { createUserClient } from '../lib/supabase.js';
import type { User } from '@supabase/supabase-js';

/**
 * Augment Express Request so all routes can access req.user and req.userId.
 * Both point to the same data — req.user is the full Supabase User object,
 * req.userId is a convenience shorthand for req.user.id.
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
      accessToken?: string;
    }
  }
}

export interface AuthRequest extends Request {
  user?: User;
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

  // Set BOTH req.user (full object, used by most routes) and req.userId (shorthand)
  req.user = user;
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
