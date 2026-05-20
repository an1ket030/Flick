import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDailyPick, invalidateDailyPickCache, getMoodPick, getPredictions } from '../services/recommendation.js';
import { getTimeCapsuleCopy } from '../services/gemini.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Middleware to protect cron routes
const verifyCronSecret = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.headers['authorization'];
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized CRON request' });
    return;
  }
  next();
};

// Retrieve today's daily pick for the authenticated user
router.get('/daily-pick', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const pick = await getDailyPick(userId);
    
    if (!pick) {
      res.json({ data: null, message: "No recommendations available right now." });
      return;
    }

    // Fetch the full film details to send back (if needed by client)
    const { data: film } = await supabaseAdmin
      .from('films')
      .select('*, film_persons(role, person(name))')
      .eq('id', pick.film_id)
      .single();

    res.json({
      data: {
        pick_meta: pick,
        film,
      }
    });
  } catch (error) {
    next(error);
  }
});

// User action on the daily pick (watched / dismissed / watchlist)
router.post('/daily-pick/action', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { film_id, action, dismiss_reason } = req.body;

    if (!film_id || !action) {
      throw new AppError('film_id and action are required', 400);
    }

    const today = new Date().toISOString().slice(0, 10);
    
    // Log the daily pick outcome
    await supabaseAdmin
      .from('daily_picks')
      .upsert({
        user_id: userId,
        pick_date: today,
        film_id,
        action_taken: action,
        dismissed_at: action === 'dismissed' ? new Date().toISOString() : null,
        dismiss_reason: dismiss_reason || null,
      }, { onConflict: 'user_id,pick_date' });

    // Handle side effects of the action
    if (action === 'watched') {
      await supabaseAdmin
        .from('user_film_entries')
        .upsert({
          user_id: userId,
          film_id,
          status: 'watched',
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id,film_id' });
    } else if (action === 'added_watchlist') {
      await supabaseAdmin
        .from('user_film_entries')
        .upsert({
          user_id: userId,
          film_id,
          status: 'planned',
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id,film_id' });
    }

    // Invalidate today's cache so next fetch gives a new pick if dismissed/watched
    await invalidateDailyPickCache(userId);

    res.json({ message: `Action ${action} recorded for daily pick.` });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/recommendations/nightly-batch
 * Triggered by GitHub Actions to pre-generate recommendations for active users.
 */
router.post('/nightly-batch', verifyCronSecret, async (_req: Request, res: Response) => {
  try {
    // Simplification: just fetch all users from taste_profiles that are completed
    const { data: users, error } = await supabaseAdmin
      .from('taste_profiles')
      .select('user_id')
      .eq('onboarding_phase', 1);
      
    if (error || !users) {
      throw new Error(error?.message || 'Failed to fetch users');
    }
    
    console.log(`Starting nightly batch for ${users.length} users...`);
    
    let success = 0;
    let failed = 0;
    
    for (const u of users) {
      try {
        await getDailyPick(u.user_id);
        success++;
      } catch(e) {
        console.error(`Failed to generate pick for ${u.user_id}:`, e);
        failed++;
      }
    }
    
    res.status(200).json({
      message: 'Nightly batch completed',
      stats: { total: users.length, success, failed }
    });
  } catch (err: any) {
    console.error('Nightly batch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Calculate and return exactly 3 mood pick films based on user's selected parameters
router.post('/mood-pick', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { mood, runtime, lang, platform } = req.body;

    if (!mood) {
      throw new AppError('Mood ID is required', 400);
    }

    // Call the engine
    const picks = await getMoodPick(userId, mood, { runtime, lang, platform });

    if (!picks || picks.length === 0) {
      res.json({ data: [] });
      return;
    }

    const filmIds = picks.map(p => p.film_id);

    // Fetch the actual film details
    const { data: films } = await supabaseAdmin
      .from('films')
      .select('id, tmdb_id, title, genres, release_year, poster_path, backdrop_path, tmdb_rating')
      .in('id', filmIds);

    // Re-sort response to match engine's pick order
    const orderedFilms = picks.map(p => films?.find(f => f.id === p.film_id)).filter(Boolean);

    res.json({ 
      data: orderedFilms 
    });
  } catch (error) {
    next(error);
  }
});

router.get('/predictions', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get array of predictions (math outliers)
    const predictions = await getPredictions(userId);
    
    if (!predictions || predictions.length === 0) {
      res.json({ data: [] });
      return;
    }

    const filmIds = predictions.map(p => p.film_id);

    // Join with real film data
    const { data: films } = await supabaseAdmin
      .from('films')
      .select('id, tmdb_id, title, genres, release_year, poster_path, backdrop_path, tmdb_rating')
      .in('id', filmIds);
      
    const filled = predictions.map(p => {
      const film = films?.find(f => f.id === p.film_id);
      return {
        ...p,
        film
      }
    });

    res.json({ data: filled });
  } catch (error) {
    next(error);
  }
});

/**
 * Sprint 3.2: Blind Spot Finder
 * Returns 12 highly rated films (global rating >= 8.0) that the user hasn't engaged with.
 * "Personalization" is applied by sorting against genres present in their taste profile 
 * (stubbed to pure rating descending for this implementation).
 */
router.get('/blind-spots', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // 1. Get all film IDs the user has interacted with
    const { data: userEntries, error: entryErr } = await supabaseAdmin
      .from('user_film_entries')
      .select('film_id')
      .eq('user_id', userId);

    if (entryErr) throw entryErr;
    
    // Fallback if no entries to empty array
    const seenIds = userEntries ? userEntries.map(e => e.film_id) : [];

    // 2. Query highly rated films
    let query = supabaseAdmin
      .from('films')
      .select('id, tmdb_id, title, release_year, poster_path, backdrop_path, tmdb_rating, genres, synopsis')
      .gte('tmdb_rating', 8.0)
      .order('tmdb_rating', { ascending: false });

    // In a real app we'd use .not('id', 'in', `(${seenIds.join(',')})`)
    // But PostgREST has URI length limits. For our Phase 3 mock, we'll fetch 100 
    // top-rated films and filter in memory, guaranteeing 12 returned.
    query.limit(100);

    const { data: topFilms, error: filmErr } = await query;
    if (filmErr) throw filmErr;

    const seenSet = new Set(seenIds);
    const blindSpots = (topFilms || [])
      .filter(f => !seenSet.has(f.id))
      .slice(0, 12);

    res.json({ data: blindSpots });
  } catch (error) {
    next(error);
  }
});

/**
 * Sprint 3.3: Time Capsule
 * Monthly generation of a birth-year related film with AI contextual copy.
 */
router.get('/time-capsule', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // 1. Check if we already have a generated time capsule for this user
    const { data: existing } = await supabaseAdmin
      .from('time_capsule_cache')
      .select('target_year, ai_copy, generated_at, films(id, tmdb_id, title, release_year, poster_path, backdrop_path, tmdb_rating, genres, synopsis)')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // For this mock phase, we assume the existing one is valid (no monthly expiry implemented yet)
      res.json({ data: existing });
      return;
    }

    // 2. Fetch user's birth year, default to 1995 if none
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('birth_year')
      .eq('id', userId)
      .single();
    
    // The "Time Capsule" year logic can be birth year, turning 10, turning 18, etc.
    // Let's use (birth_year + 18) to represent their coming-of-age year. Defaults to 1999 (1981+18)
    const birthYear = profile?.birth_year || 1981;
    const targetYear = birthYear + 18; // Coming of age year

    // 3. Find a highly-rated film from that exact year
    const { data: films, error: filmErr } = await supabaseAdmin
      .from('films')
      .select('id, tmdb_id, title, release_year, poster_path, backdrop_path, tmdb_rating, genres, synopsis')
      .eq('release_year', targetYear)
      .gte('tmdb_rating', 7.5)
      .order('tmdb_rating', { ascending: false })
      .limit(1)
      .single();

    if (filmErr || !films) {
      throw new AppError(`Could not find a suitable Time Capsule film for year ${targetYear}`, 404);
    }

    // 4. Generate AI Copy
    const aiCopy = await getTimeCapsuleCopy(targetYear, films.title, films.synopsis);

    // 5. Cache & Return
    await supabaseAdmin
      .from('time_capsule_cache')
      .insert({
        user_id: userId,
        target_year: targetYear,
        film_id: films.id,
        ai_copy: aiCopy,
      });

    res.json({
      data: {
        target_year: targetYear,
        ai_copy: aiCopy,
        generated_at: new Date().toISOString(),
        films
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Sprint 3.5: Editorial Collections
 * Pulls human-curated film collections.
 */
router.get('/collections', requireAuth, async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: collections, error } = await supabaseAdmin
      .from('editorial_collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ data: collections });
  } catch (err) {
    next(err);
  }
});

export default router;
