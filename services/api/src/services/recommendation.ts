/**
 * Recommendation Engine — Flick Phase 1
 *
 * Layered pick algorithm (v1):
 *   Layer 1  — Genre alignment (loves / hates)
 *   Layer 2  — Pace & tone proximity (slider distance)
 *   Layer 3  — Region preference
 *   Layer 4  — Format preference
 *   Layer 5  — Quality gate (min tmdb_rating 6.5, min vote_count 500)
 *   Layer 6  — Exclusion (already watched / dismissed today)
 *
 * Confidence score 0–1, mapped to low/medium/high labels.
 * Cached in Redis for 24h per user.
 */
import { supabaseAdmin } from '../lib/supabase.js';
import { redis } from '../lib/redis.js';

const ALGO_VERSION = '1.0.0';

export interface PickResult {
  film_id: string;
  confidence_score: number;
  confidence_level: 'low' | 'medium' | 'high';
  layers_used: string[];
  algorithm_version: string;
}

interface TasteProfile {
  user_id: string;
  format_prefs: string[] | null;
  region_prefs: string[] | null;
  pace_slider: number | null;
  tone_slider: number | null;
  genre_loves: number[] | null;
  genre_hates: number[] | null;
  onboarding_phase: number;
}

interface FilmRow {
  id: string;
  genres: number[] | null;
  original_language: string | null;
  countries: string[] | null;
  tmdb_rating: number | null;
  tmdb_vote_count: number | null;
  runtime_minutes: number | null;
  adult: boolean | null;
}

const REDIS_PICK_TTL = 60 * 60 * 24; // 24 hours

function confidenceLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

/** Score a film against a taste profile. Returns 0–1. */
function scoreFilm(film: FilmRow, taste: TasteProfile): { score: number; layers: string[] } {
  let score = 0;
  const layers: string[] = [];

  const genres = film.genres ?? [];
  const loves = taste.genre_loves ?? [];
  const hates = taste.genre_hates ?? [];

  // Layer 1: Genre alignment
  const loveHits = genres.filter(g => loves.includes(g)).length;
  const hateHits = genres.filter(g => hates.includes(g)).length;
  if (loveHits > 0) {
    score += Math.min(loveHits * 0.15, 0.35);
    layers.push('genre_loves');
  }
  if (hateHits > 0) {
    score -= Math.min(hateHits * 0.25, 0.5);
    layers.push('genre_hate_penalty');
  }

  // Layer 2: Pace & tone proximity
  // We approximate tone from genre (comedy/animation → high tone, horror → low tone)
  const highToneGenres = [35, 16, 10751]; // comedy, animation, family
  const lowToneGenres = [27, 80, 53, 10752]; // horror, crime, thriller, war
  const filmToneApprox = genres.some(g => highToneGenres.includes(g))
    ? 8
    : genres.some(g => lowToneGenres.includes(g))
    ? 2
    : 5;
  const toneTarget = (taste.tone_slider ?? 5);
  const toneDist = Math.abs(filmToneApprox - toneTarget) / 10;
  score += (1 - toneDist) * 0.2;
  layers.push('tone_proximity');

  // Layer 3: Region preference
  const lang = film.original_language ?? '';
  const regionPrefs: string[] = taste.region_prefs ?? [];
  const langToRegion: Record<string, string> = {
    en: 'hollywood', hi: 'bollywood', ja: 'east_asian',
    ko: 'east_asian', fr: 'european', de: 'european',
    it: 'european', es: 'south_american', pt: 'south_american',
    sv: 'scandinavian', da: 'scandinavian', no: 'scandinavian',
    fa: 'middle_eastern', ar: 'middle_eastern', zh: 'east_asian',
  };
  const filmRegion = langToRegion[lang];
  if (filmRegion && regionPrefs.includes(filmRegion)) {
    score += 0.1;
    layers.push('region_pref');
  } else if (filmRegion && !regionPrefs.includes(filmRegion) && regionPrefs.length > 0) {
    score -= 0.05;
  }

  // Layer 4: Format preference (basic)
  const formatPrefs: string[] = taste.format_prefs ?? [];
  const isAnimation = genres.includes(16);
  const isAnime = genres.includes(16) && lang === 'ja';
  if (formatPrefs.includes('all') || formatPrefs.length === 0) {
    score += 0.05;
    layers.push('format_any');
  } else if (isAnime && formatPrefs.includes('anime')) {
    score += 0.15;
    layers.push('format_anime');
  } else if (isAnimation && formatPrefs.includes('animation')) {
    score += 0.1;
    layers.push('format_animation');
  } else if (!isAnimation && formatPrefs.includes('live_action')) {
    score += 0.08;
    layers.push('format_live_action');
  }

  return { score: Math.max(0, Math.min(1, score)), layers };
}

export async function getDailyPick(userId: string): Promise<PickResult | null> {
  const cacheKey = `daily_pick:${userId}:${new Date().toISOString().slice(0, 10)}`;

  // Check Redis cache
  const cached = await redis.get<PickResult>(cacheKey);
  if (cached) return cached;

  const supabase = supabaseAdmin;

  // Get taste profile
  const { data: taste } = await supabase
    .from('taste_profiles')
    .select('user_id, format_prefs, region_prefs, pace_slider, tone_slider, genre_loves, genre_hates, onboarding_phase')
    .eq('user_id', userId)
    .single();

  // Get today's already-dismissed picks
  const today = new Date().toISOString().slice(0, 10);
  const { data: existingPicks } = await supabase
    .from('daily_picks')
    .select('film_id, action_taken')
    .eq('user_id', userId)
    .eq('pick_date', today);

  const dismissedFilmIds = (existingPicks ?? [])
    .filter(p => p.action_taken === 'dismissed')
    .map(p => p.film_id as string);

  // Get already-watched film IDs
  const { data: watchedEntries } = await supabase
    .from('user_film_entries')
    .select('film_id')
    .eq('user_id', userId)
    .eq('status', 'watched');

  const excludedIds = new Set([
    ...dismissedFilmIds,
    ...(watchedEntries ?? []).map(e => e.film_id as string),
  ]);

  // Fetch candidate films (quality gate)
  const { data: candidates } = await supabase
    .from('films')
    .select('id, genres, original_language, countries, tmdb_rating, tmdb_vote_count, runtime_minutes, adult')
    .gte('tmdb_rating', 6.5)
    .gte('tmdb_vote_count', 500)
    .eq('adult', false)
    .limit(500);

  if (!candidates || candidates.length === 0) return null;

  // Filter excluded + score
  const scored = candidates
    .filter(f => !excludedIds.has(f.id))
    .map(f => {
      const { score, layers } = taste
        ? scoreFilm(f as FilmRow, taste as unknown as TasteProfile)
        : { score: 0.5, layers: ['no_taste_profile'] };
      return { film_id: f.id, score, layers };
    })
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  // Top 3 candidates → pick randomly from top 3 for diversity
  const topCandidates = scored.slice(0, Math.min(3, scored.length));
  const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)]!;

  const result: PickResult = {
    film_id: chosen.film_id,
    confidence_score: chosen.score,
    confidence_level: confidenceLevel(chosen.score),
    layers_used: chosen.layers,
    algorithm_version: ALGO_VERSION,
  };

  // Cache for 24h
  await redis.set(cacheKey, result, { ex: REDIS_PICK_TTL });

  return result;
}

export async function invalidateDailyPickCache(userId: string): Promise<void> {
  const cacheKey = `daily_pick:${userId}:${new Date().toISOString().slice(0, 10)}`;
  await redis.del(cacheKey);
}

export async function getMoodPick(
  userId: string, 
  mood: string, 
  filters: { runtime?: boolean, lang?: boolean, platform?: boolean }
): Promise<PickResult[]> {
  const supabase = supabaseAdmin;

  // Get already-watched film IDs to exclude
  const { data: watchedEntries } = await supabase
    .from('user_film_entries')
    .select('film_id')
    .eq('user_id', userId)
    .in('status', ['watched', 'planned', 'watching']); // Exclude all known to keep mood pick totally fresh

  const excludedIds = new Set((watchedEntries ?? []).map(e => e.film_id as string));

  // Base query: Highly rated, good popularity to ensure mood hits are solid recommendations
  let query = supabase
    .from('films')
    .select('id, genres, original_language, countries, tmdb_rating, tmdb_vote_count, runtime_minutes, adult')
    .gte('tmdb_rating', 6.5)
    .gte('tmdb_vote_count', 1000)
    .eq('adult', false);

  // Apply User Filters
  if (filters.runtime) query = query.lte('runtime_minutes', 100);
  if (filters.lang) query = query.eq('original_language', 'en');
  // Streaming filter (platform) to be handled later or joined if table exists. We omit it from strict SQL for now unless we do a join.

  // Apply Mood Definitions
  switch (mood) {
    case 'laugh':
      // Comedy focus
      query = query.contains('genres', [35]);
      break;
    case 'mind_bending':
      // Sci-Fi, Mystery, Thriller combos
      query = query.overlaps('genres', [878, 9648, 53]); 
      // Often longer runtimes implicitly, but we just filter genre
      break;
    case 'heartbreak':
      // Drama and Romance
      query = query.overlaps('genres', [18, 10749]);
      break;
    case 'adrenaline':
      // Action/Thriller, fast-paced
      query = query.overlaps('genres', [28, 53, 12]);
      break;
    case 'disturbed':
      // Horror, Crime, intense psychological
      query = query.overlaps('genres', [27, 80, 53]);
      break;
    case 'warm':
      // Feel-good: Family, Romance, Comedy, Animation
      query = query.overlaps('genres', [10751, 10749, 35, 16]);
      break;
    case 'brain_off':
      // Action, Comedy, Fantasy. Not too high rating requirement needed, just fun.
      query = query.overlaps('genres', [28, 35, 14]);
      break;
    case 'visual':
      // Animation, Fantasy, Sci-Fi. Known for visual spectacle.
      query = query.overlaps('genres', [16, 14, 878]);
      break;
    default:
      break;
  }

  // Fetch top 50 matches for the mood
  const { data: candidates } = await query.order('tmdb_rating', { ascending: false }).limit(50);

  if (!candidates) return [];

  // Filter out seen films
  const validCandidates = candidates.filter(f => !excludedIds.has(f.id));

  // We want EXACTLY 3 results, shuffled to keep it fresh
  const shuffled = validCandidates.sort(() => 0.5 - Math.random());
  const finalPicks = shuffled.slice(0, 3);

  return finalPicks.map(chosen => ({
    film_id: chosen.id,
    confidence_score: 0.9, // Mood matches are inherently high confidence for the specific intent
    confidence_level: 'high',
    layers_used: ['mood_engine', mood],
    algorithm_version: ALGO_VERSION,
  }));
}

export interface PredictionResult {
  film_id: string;
  tmdb_rating: number;
  predicted_score: number;
  difference: number;
  why: string[];
}

export async function getPredictions(userId: string): Promise<PredictionResult[]> {
  const supabase = supabaseAdmin;

  // Get taste profile
  const { data: taste } = await supabase
    .from('taste_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!taste) return [];

  // Exclude watched/dismissed
  const { data: watchedEntries } = await supabase
    .from('user_film_entries')
    .select('film_id')
    .eq('user_id', userId);
    
  const excludedIds = new Set((watchedEntries ?? []).map(e => e.film_id as string));

  // Fetch candidate pool (mix of popular and mid-tier films)
  const { data: candidates } = await supabase
    .from('films')
    .select('id, genres, original_language, countries, tmdb_rating, tmdb_vote_count, runtime_minutes, adult')
    .gte('tmdb_vote_count', 2000)
    .eq('adult', false)
    .limit(1000);

  if (!candidates) return [];

  // Calculate predicted score vs TMDB consensus
  // Predicted = TMDb + ((TasteScore - 0.4) * 5)
  // Example: 0.8 Taste -> +2.0 boost. 0.1 Taste -> -1.5 penalty.
  const predictions: PredictionResult[] = candidates
    .filter(f => !excludedIds.has(f.id))
    .map(f => {
      const { score: tasteScore, layers } = scoreFilm(f as FilmRow, taste as TasteProfile);
      const tmdbRating = f.tmdb_rating || 5.0;
      let predicted_score = tmdbRating + ((tasteScore - 0.4) * 5);
      
      // Clamp between 1.0 and 10.0
      predicted_score = Math.max(1.0, Math.min(10.0, predicted_score));
      
      return {
        film_id: f.id,
        tmdb_rating: tmdbRating,
        predicted_score: parseFloat(predicted_score.toFixed(1)),
        difference: parseFloat((predicted_score - tmdbRating).toFixed(1)),
        why: layers
      };
    });

  // Outliers: sorting by highest positive difference (Films you will love way more than average)
  const positiveOutliers = predictions
    .filter(p => p.difference >= 1.0)
    .sort((a, b) => b.difference - a.difference)
    .slice(0, 10);

  return positiveOutliers;
}
