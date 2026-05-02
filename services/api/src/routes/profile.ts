import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// ============================================================
// GET /api/profile/mood-history
// Sprint 3.5: Returns an aggregation of the user's movie taste 
// based on their watched films.
// ============================================================
router.get('/mood-history', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Fetch all watched films for the user with their genres
    const { data: entries, error } = await supabaseAdmin
      .from('user_film_entries')
      .select(`
        id,
        films ( genres )
      `)
      .eq('user_id', userId)
      .eq('status', 'watched');

    if (error) {
      throw error;
    }

    if (!entries || entries.length === 0) {
      res.json({ data: { total_watched: 0, top_genres: [] } });
      return;
    }

    // Aggregate genres
    const genreCounts: Record<number, number> = {};
    entries.forEach(entry => {
      const film = entry.films as unknown as { genres: number[] | null };
      if (film && film.genres) {
        film.genres.forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      }
    });

    // Map TMDB genre IDs to names and sort
    const GENRE_MAP: Record<number, string> = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
      53: 'Thriller', 10752: 'War', 37: 'Western',
    };

    const sortedGenres = Object.entries(genreCounts)
      .map(([idStr, count]) => ({
        id: parseInt(idStr),
        name: GENRE_MAP[parseInt(idStr)] || 'Unknown',
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5

    res.json({ data: {
      total_watched: entries.length,
      top_genres: sortedGenres
    }});
  } catch (err) {
    next(err);
  }
});

export default router;
