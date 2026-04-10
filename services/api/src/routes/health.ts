import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { redis } from '../lib/redis.js';

const router = Router();

router.get('/', async (_req, res) => {
  const startTime = Date.now();
  const checks: Record<string, 'ok' | 'error'> = {};

  // Check Supabase
  try {
    const { error } = await supabaseAdmin.from('films').select('id').limit(1);
    checks['supabase'] = error ? 'error' : 'ok';
  } catch {
    checks['supabase'] = 'error';
  }

  // Check Redis
  try {
    await redis.ping();
    checks['redis'] = 'ok';
  } catch {
    checks['redis'] = 'error';
  }

  const allHealthy = Object.values(checks).every((v) => v === 'ok');
  const latencyMs = Date.now() - startTime;

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    latency_ms: latencyMs,
    version: process.env['npm_package_version'] ?? '0.0.1',
    checks,
  });
});

export default router;
