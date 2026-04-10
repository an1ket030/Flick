import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { withCache, CacheKeys, CacheTTL } from '../lib/redis.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// ============================================================
// GET /api/films/search
// ============================================================
const searchSchema = z.object({
  q: z.string().min(1).max(200),
  genre_ids: z.string().optional(),
  year_min: z.coerce.number().optional(),
  year_max: z.coerce.number().optional(),
  language: z.string().length(2).optional(),
  min_rating: z.coerce.number().min(0).max(10).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

router.get('/search', async (req, res, next) => {
  try {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid search parameters.', details: parsed.error.flatten() },
      });
      return;
    }

    const params = parsed.data;
    const genreIds = params.genre_ids?.split(',').map(Number).filter(Boolean);
    const cacheKey = CacheKeys.filmSearch(
      params.q,
      JSON.stringify({ genreIds, year_min: params.year_min, year_max: params.year_max, language: params.language })
    );

    const results = await withCache(cacheKey, CacheTTL.filmSearch, async () => {
      const { data, error } = await supabaseAdmin.rpc('search_films', {
        p_query: params.q,
        p_limit: params.limit,
        p_offset: params.offset,
        p_genre_ids: genreIds ?? null,
        p_year_min: params.year_min ?? null,
        p_year_max: params.year_max ?? null,
        p_language: params.language ?? null,
        p_min_rating: params.min_rating ?? null,
      });
      if (error) throw error;
      return data;
    });

    res.json({ data: results, error: null });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/films/:id — Film detail
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };

    const filmData = await withCache(CacheKeys.filmDetail(id), CacheTTL.filmDetail, async () => {
      const { data: film, error: filmErr } = await supabaseAdmin
        .from('films')
        .select(`
          *,
          film_persons (
            role, character_name, billing_order,
            persons (id, tmdb_person_id, name, profile_path, known_for_department)
          )
        `)
        .eq('id', id)
        .single();

      if (filmErr || !film) throw Object.assign(new Error('Film not found'), { statusCode: 404, code: 'NOT_FOUND' });
      return film;
    });

    res.json({ data: filmData, error: null });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/films/:id/streaming?country=GB
// ============================================================
router.get('/:id/streaming', async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const country = (req.query['country'] as string | undefined) ?? 'US';
    const cacheKey = CacheKeys.streamingAvail(id, country);

    const streaming = await withCache(cacheKey, CacheTTL.streamingAvail, async () => {
      const { data, error } = await supabaseAdmin
        .from('streaming_availability')
        .select('*')
        .eq('film_id', id)
        .eq('country_code', country.toUpperCase())
        .order('platform_name');

      if (error) throw error;
      return data;
    });

    res.json({ data: streaming, error: null });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/films/:id/similar
// ============================================================
router.get('/:id/similar', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params as { id: string };

    // Fetch film's genres, then find similar films by genre overlap
    const { data: film } = await supabaseAdmin
      .from('films')
      .select('genres, release_year')
      .eq('id', id)
      .single();

    if (!film) {
      res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Film not found.' } });
      return;
    }

    const { data: similar } = await supabaseAdmin
      .from('films')
      .select('id, tmdb_id, title, release_year, poster_path, tmdb_rating, tmdb_vote_count, genres')
      .overlaps('genres', film.genres)
      .neq('id', id)
      .gte('metadata_quality_score', 0.4)
      .gte('tmdb_vote_count', 1000)
      .order('tmdb_vote_count', { ascending: false })
      .limit(12);

    res.json({ data: similar ?? [], error: null });
  } catch (err) {
    next(err);
  }
});

export default router;
