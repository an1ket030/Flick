-- ============================================================
-- Migration 004: PostgreSQL Functions
-- ============================================================

-- ============================================================
-- Compute metadata quality score for a film
-- ============================================================
CREATE OR REPLACE FUNCTION public.compute_metadata_quality_score(
  p_title TEXT,
  p_release_year SMALLINT,
  p_runtime_minutes SMALLINT,
  p_synopsis TEXT,
  p_poster_path TEXT,
  p_tmdb_rating FLOAT,
  p_tmdb_vote_count INTEGER,
  p_tagline TEXT,
  p_genres INTEGER[],
  p_director_id UUID,   -- NULL if no director linked
  p_keywords TEXT[]
) RETURNS FLOAT AS $$
DECLARE
  score FLOAT := 0.0;
BEGIN
  IF p_title IS NOT NULL AND p_title != ''    THEN score := score + 0.10; END IF;
  IF p_release_year IS NOT NULL              THEN score := score + 0.10; END IF;
  IF p_runtime_minutes IS NOT NULL           THEN score := score + 0.08; END IF;
  IF p_synopsis IS NOT NULL AND LENGTH(p_synopsis) > 50 THEN score := score + 0.10; END IF;
  IF p_poster_path IS NOT NULL               THEN score := score + 0.08; END IF;
  IF p_tmdb_rating IS NOT NULL AND p_tmdb_rating > 0 THEN score := score + 0.05; END IF;
  IF p_tmdb_vote_count > 1000                THEN score := score + 0.10; END IF;
  IF p_tmdb_vote_count > 10000               THEN score := score + 0.05; END IF;
  IF p_tmdb_vote_count > 50000               THEN score := score + 0.05; END IF;
  IF p_tagline IS NOT NULL AND p_tagline != '' THEN score := score + 0.03; END IF;
  IF p_genres IS NOT NULL AND ARRAY_LENGTH(p_genres, 1) >= 2 THEN score := score + 0.08; END IF;
  IF p_director_id IS NOT NULL               THEN score := score + 0.08; END IF;
  IF p_keywords IS NOT NULL AND ARRAY_LENGTH(p_keywords, 1) >= 5 THEN score := score + 0.08; END IF;
  RETURN LEAST(1.0, score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- Search films with pg_trgm (full-text search)
-- ============================================================
CREATE OR REPLACE FUNCTION public.search_films(
  p_query TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_genre_ids INT[] DEFAULT NULL,
  p_year_min SMALLINT DEFAULT NULL,
  p_year_max SMALLINT DEFAULT NULL,
  p_language TEXT DEFAULT NULL,
  p_min_rating FLOAT DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  tmdb_id INTEGER,
  title TEXT,
  original_title TEXT,
  release_year SMALLINT,
  runtime_minutes SMALLINT,
  original_language VARCHAR,
  countries TEXT[],
  genres INTEGER[],
  synopsis TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  tmdb_rating FLOAT,
  tmdb_vote_count INTEGER,
  metadata_quality_score FLOAT,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.tmdb_id,
    f.title,
    f.original_title,
    f.release_year,
    f.runtime_minutes,
    f.original_language,
    f.countries,
    f.genres,
    f.synopsis,
    f.poster_path,
    f.backdrop_path,
    f.tmdb_rating,
    f.tmdb_vote_count,
    f.metadata_quality_score,
    GREATEST(
      similarity(f.title, p_query),
      COALESCE(similarity(f.original_title, p_query), 0)
    ) AS similarity_score
  FROM public.films f
  WHERE
    (
      f.title ILIKE '%' || p_query || '%'
      OR f.original_title ILIKE '%' || p_query || '%'
      OR similarity(f.title, p_query) > 0.15
      OR similarity(COALESCE(f.original_title, ''), p_query) > 0.15
    )
    AND (p_genre_ids IS NULL OR f.genres && p_genre_ids)
    AND (p_year_min IS NULL OR f.release_year >= p_year_min)
    AND (p_year_max IS NULL OR f.release_year <= p_year_max)
    AND (p_language IS NULL OR f.original_language = p_language)
    AND (p_min_rating IS NULL OR f.tmdb_rating >= p_min_rating)
    AND f.adult = FALSE
    AND f.metadata_quality_score >= 0.4
  ORDER BY
    similarity_score DESC,
    f.tmdb_vote_count DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- Get library statistics for a user
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_library_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_watched',    COUNT(*) FILTER (WHERE ufe.status = 'watched'),
    'total_planned',    COUNT(*) FILTER (WHERE ufe.status = 'planned'),
    'total_hours',      COALESCE(SUM(f.runtime_minutes) FILTER (WHERE ufe.status = 'watched') / 60, 0),
    'average_rating',   ROUND(AVG(ufe.rating) FILTER (WHERE ufe.rating IS NOT NULL)::NUMERIC, 1),
    'this_year',        COUNT(*) FILTER (WHERE ufe.status = 'watched' AND ufe.date_watched >= DATE_TRUNC('year', NOW())),
    'this_month',       COUNT(*) FILTER (WHERE ufe.status = 'watched' AND ufe.date_watched >= DATE_TRUNC('month', NOW())),
    'rewatch_count',    COUNT(*) FILTER (WHERE ufe.rewatch_number > 1),
    'ratings_count',    COUNT(*) FILTER (WHERE ufe.rating IS NOT NULL)
  )
  INTO result
  FROM public.user_film_entries ufe
  JOIN public.films f ON f.id = ufe.film_id
  WHERE ufe.user_id = p_user_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- Enable Realtime on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_picks;
