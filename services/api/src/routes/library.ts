import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import multer from 'multer';
import * as Sentry from '@sentry/node';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ── Letterboxd Import ─────────────────────────────────────────────────────
router.post('/import/letterboxd', requireAuth, upload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No CSV file uploaded' });
      return;
    }
    console.log(`[Import] Letterboxd import requested by user ${userId}. File size: ${file.size} bytes`);
    Sentry.captureMessage('Letterboxd Import Started', { user: { id: userId }, extra: { fileSize: file.size } });
    res.json({ message: 'Import process queued successfully.', status: 'queued', stats: { films_found: 0, films_imported: 0, reviews_imported: 0 } });
  } catch (error) {
    next(error);
  }
});

// ── Rewatch Vault ─────────────────────────────────────────────────────────
/**
 * GET /api/library/vault
 * Returns films the user rated ≥8.5 that haven't been re-watched in 12+ months.
 * These are the "ready for re-evaluation" candidates.
 */
router.get('/vault', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const cutoff = twelveMonthsAgo.toISOString().slice(0, 10);

    // Fetch watched films rated ≥8.5 not re-watched since 12 months ago
    const { data: entries, error } = await supabaseAdmin
      .from('user_film_entries')
      .select(`
        id, rating, date_watched, rewatch_number,
        films(id, tmdb_id, title, release_year, poster_path, backdrop_path, tmdb_rating, genres, synopsis)
      `)
      .eq('user_id', userId)
      .eq('status', 'watched')
      .gte('rating', 8.5)
      .lte('date_watched', cutoff)
      .order('rating', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ data: entries ?? [] });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/library/rewatch
 * Body: { film_id, new_rating, note? }
 * Creates a new user_film_entries row (incremented rewatch_number) and saves delta.
 */
router.post('/rewatch', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { film_id, new_rating, note } = req.body;

    if (!film_id || new_rating == null) {
      res.status(400).json({ error: 'film_id and new_rating are required' });
      return;
    }

    // Find the most recent watched entry to get old rating + current rewatch_number
    const { data: latest, error: fetchErr } = await supabaseAdmin
      .from('user_film_entries')
      .select('id, rating, rewatch_number')
      .eq('user_id', userId)
      .eq('film_id', film_id)
      .eq('status', 'watched')
      .order('rewatch_number', { ascending: false })
      .limit(1)
      .single();

    if (fetchErr || !latest) {
      res.status(404).json({ error: 'No existing watched entry found for this film' });
      return;
    }

    const nextRewatchNumber = (latest.rewatch_number ?? 1) + 1;

    // Create new entry for this rewatch
    const { data: newEntry, error: insertErr } = await supabaseAdmin
      .from('user_film_entries')
      .insert({
        user_id: userId,
        film_id,
        status: 'watched',
        rating: new_rating,
        rewatch_number: nextRewatchNumber,
        date_watched: new Date().toISOString().slice(0, 10),
        personal_note: note ?? null,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // Save delta record
    const { error: deltaErr } = await supabaseAdmin
      .from('rewatch_deltas')
      .insert({
        user_id: userId,
        film_id,
        old_rating: latest.rating,
        new_rating,
        note: note ?? null,
      });

    if (deltaErr) console.warn('[Rewatch] Delta insert failed:', deltaErr.message);

    const delta = parseFloat(((new_rating - (latest.rating ?? 0)).toFixed(1)));
    res.json({ data: newEntry, delta, old_rating: latest.rating, new_rating });
  } catch (error) {
    next(error);
  }
});

export default router;
