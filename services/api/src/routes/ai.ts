/**
 * AI Routes — Flick Phase 2 (Sprint 2.4)
 *
 * POST /api/ai/convince-me
 *   Body: { film_id: string }
 *   Returns: { pitch: string, cached: boolean }
 *
 * Uses Gemini 1.5 Flash with Redis caching (7-day TTL).
 */

import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { getConvinceMe } from '../services/gemini.js';

const router = Router();

router.post(
  '/convince-me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { film_id } = req.body;

      if (!film_id || typeof film_id !== 'string') {
        res.status(400).json({ error: 'film_id is required' });
        return;
      }

      // Fetch film metadata from Supabase
      const { data: film, error } = await supabaseAdmin
        .from('films')
        .select('id, title, release_year, genres, synopsis, tmdb_rating')
        .eq('id', film_id)
        .single();

      if (error || !film) {
        res.status(404).json({ error: 'Film not found' });
        return;
      }

      const result = await getConvinceMe(
        userId,
        film.id,
        film.title,
        film.release_year,
        film.genres ?? [],
        film.synopsis,
        film.tmdb_rating ?? 7.0,
      );

      res.json({ pitch: result.pitch, cached: result.cached });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
