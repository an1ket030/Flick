-- ============================================================
-- Migration 001: Core Tables
-- Flick — Film Discovery & Tracking Platform
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  country_code CHAR(2),
  birth_year   SMALLINT,
  timezone     TEXT DEFAULT 'UTC',
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX profiles_username_idx ON public.profiles (username);

-- ============================================================
-- TASTE PROFILES
-- ============================================================
CREATE TABLE public.taste_profiles (
  user_id          UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  format_prefs     JSONB DEFAULT '{}',
  region_prefs     JSONB DEFAULT '{}',
  pace_slider      FLOAT DEFAULT 0.5,
  tone_slider      FLOAT DEFAULT 0.5,
  genre_loves      INT[] DEFAULT '{}',
  genre_hates      INT[] DEFAULT '{}',
  adventurousness  FLOAT DEFAULT 0.5,
  primary_intent   TEXT,
  onboarding_phase SMALLINT DEFAULT 0,
  capsule_year     SMALLINT,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_pace   CHECK (pace_slider BETWEEN 0 AND 1),
  CONSTRAINT valid_tone   CHECK (tone_slider BETWEEN 0 AND 1),
  CONSTRAINT valid_adv    CHECK (adventurousness BETWEEN 0 AND 1)
);

-- ============================================================
-- FILMS
-- ============================================================
CREATE TABLE public.films (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_id                INTEGER UNIQUE NOT NULL,
  imdb_id                TEXT,
  title                  TEXT NOT NULL,
  original_title         TEXT,
  release_year           SMALLINT,
  runtime_minutes        SMALLINT,
  original_language      VARCHAR(10),
  countries              TEXT[] DEFAULT '{}',
  genres                 INTEGER[] DEFAULT '{}',
  synopsis               TEXT,
  tagline                TEXT,
  poster_path            TEXT,
  backdrop_path          TEXT,
  tmdb_rating            FLOAT,
  tmdb_vote_count        INTEGER DEFAULT 0,
  keywords               TEXT[] DEFAULT '{}',
  content_rating         TEXT,
  adult                  BOOLEAN DEFAULT FALSE,
  metadata_quality_score FLOAT DEFAULT 0.0,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_rating      CHECK (tmdb_rating IS NULL OR tmdb_rating BETWEEN 0 AND 10),
  CONSTRAINT valid_quality     CHECK (metadata_quality_score BETWEEN 0 AND 1)
);

-- Indexes for film queries
CREATE INDEX films_tmdb_id_idx        ON public.films (tmdb_id);
CREATE INDEX films_release_year_idx   ON public.films (release_year);
CREATE INDEX films_genres_idx         ON public.films USING GIN (genres);
CREATE INDEX films_countries_idx      ON public.films USING GIN (countries);
CREATE INDEX films_keywords_idx       ON public.films USING GIN (keywords);
CREATE INDEX films_quality_idx        ON public.films (metadata_quality_score);
CREATE INDEX films_vote_count_idx     ON public.films (tmdb_vote_count DESC);
CREATE INDEX films_language_idx       ON public.films (original_language);
-- Full-text search indexes (pg_trgm)
CREATE INDEX films_title_trgm_idx     ON public.films USING GIN (title gin_trgm_ops);
CREATE INDEX films_orig_title_trgm_idx ON public.films USING GIN (original_title gin_trgm_ops);

-- ============================================================
-- PERSONS (Directors, Actors, Crew)
-- ============================================================
CREATE TABLE public.persons (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_person_id       INTEGER UNIQUE NOT NULL,
  name                 TEXT NOT NULL,
  profile_path         TEXT,
  known_for_department TEXT,
  biography            TEXT,
  birthday             DATE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX persons_tmdb_id_idx  ON public.persons (tmdb_person_id);
CREATE INDEX persons_name_trgm_idx ON public.persons USING GIN (name gin_trgm_ops);

-- ============================================================
-- FILM-PERSON JUNCTION
-- ============================================================
CREATE TABLE public.film_persons (
  film_id        UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  person_id      UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  role           TEXT NOT NULL,
  character_name TEXT,
  billing_order  SMALLINT,
  PRIMARY KEY (film_id, person_id, role),
  CONSTRAINT valid_role CHECK (role IN ('director','actor','writer','cinematographer','composer','producer'))
);

CREATE INDEX film_persons_film_idx   ON public.film_persons (film_id);
CREATE INDEX film_persons_person_idx ON public.film_persons (person_id);
CREATE INDEX film_persons_role_idx   ON public.film_persons (role);

-- ============================================================
-- USER FILM ENTRIES (Library)
-- ============================================================
CREATE TABLE public.user_film_entries (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  film_id        UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'planned',
  rating         NUMERIC(3,1),
  personal_note  TEXT,
  date_watched   DATE,
  rewatch_number SMALLINT NOT NULL DEFAULT 1,
  is_hidden      BOOLEAN NOT NULL DEFAULT FALSE,
  custom_tags    TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, film_id, rewatch_number),
  CONSTRAINT valid_status CHECK (status IN ('planned','watching','watched','paused','dropped')),
  CONSTRAINT valid_rating CHECK (rating IS NULL OR (rating >= 0.5 AND rating <= 10.0 AND (rating * 2) = FLOOR(rating * 2)))
);

CREATE INDEX ufe_user_id_idx      ON public.user_film_entries (user_id);
CREATE INDEX ufe_film_id_idx      ON public.user_film_entries (film_id);
CREATE INDEX ufe_user_status_idx  ON public.user_film_entries (user_id, status);
CREATE INDEX ufe_user_rating_idx  ON public.user_film_entries (user_id, rating DESC NULLS LAST);
CREATE INDEX ufe_date_watched_idx ON public.user_film_entries (user_id, date_watched DESC NULLS LAST);

-- ============================================================
-- STREAMING AVAILABILITY
-- ============================================================
CREATE TABLE public.streaming_availability (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  film_id       UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  country_code  CHAR(2) NOT NULL,
  platform_id   INTEGER NOT NULL,
  platform_name TEXT NOT NULL,
  logo_path     TEXT,
  stream_type   TEXT NOT NULL,
  stream_url    TEXT,
  verified_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(film_id, country_code, platform_id, stream_type),
  CONSTRAINT valid_stream_type CHECK (stream_type IN ('subscription','rent','buy','free'))
);

CREATE INDEX streaming_film_country_idx  ON public.streaming_availability (film_id, country_code);
CREATE INDEX streaming_country_idx       ON public.streaming_availability (country_code);
CREATE INDEX streaming_verified_at_idx   ON public.streaming_availability (verified_at);

-- ============================================================
-- DAILY PICKS
-- ============================================================
CREATE TABLE public.daily_picks (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pick_date        DATE NOT NULL,
  film_id          UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  confidence_score FLOAT,
  confidence_level TEXT,
  convince_me      JSONB,
  algorithm_version TEXT DEFAULT 'v1.0',
  layers_used      TEXT[] DEFAULT '{}',
  action_taken     TEXT,
  dismissed_at     TIMESTAMPTZ,
  dismiss_reason   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pick_date),
  CONSTRAINT valid_action       CHECK (action_taken IS NULL OR action_taken IN ('watched','dismissed','ignored','added_watchlist')),
  CONSTRAINT valid_dismiss_rsn  CHECK (dismiss_reason IS NULL OR dismiss_reason IN ('wrong_mood','already_seen','not_interested'))
);

CREATE INDEX daily_picks_user_date_idx ON public.daily_picks (user_id, pick_date DESC);

-- ============================================================
-- MOOD SESSIONS
-- ============================================================
CREATE TABLE public.mood_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood_selected   TEXT NOT NULL,
  filters_applied JSONB,
  films_returned  UUID[] DEFAULT '{}',
  film_chosen     UUID REFERENCES public.films(id),
  session_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX mood_sessions_user_idx ON public.mood_sessions (user_id, session_at DESC);

-- ============================================================
-- RECOMMENDATION EVENTS (feedback loop)
-- ============================================================
CREATE TABLE public.recommendation_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  film_id           UUID REFERENCES public.films(id) ON DELETE SET NULL,
  rec_type          TEXT NOT NULL,
  algorithm_version TEXT,
  confidence_score  FLOAT,
  shown_at          TIMESTAMPTZ DEFAULT NOW(),
  action_taken      TEXT,
  dismiss_reason    TEXT
);

CREATE INDEX rec_events_user_idx    ON public.recommendation_events (user_id, shown_at DESC);
CREATE INDEX rec_events_type_idx    ON public.recommendation_events (rec_type);
CREATE INDEX rec_events_film_idx    ON public.recommendation_events (film_id);

-- ============================================================
-- FRIENDSHIPS
-- ============================================================
CREATE TABLE public.friendships (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_a      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id_b      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'pending',
  initiated_by   UUID NOT NULL REFERENCES public.profiles(id),
  visibility_a   JSONB DEFAULT '{"ratings":true,"watchlist":true,"recent_watches":true,"collections":true}',
  visibility_b   JSONB DEFAULT '{"ratings":true,"watchlist":true,"recent_watches":true,"collections":true}',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  accepted_at    TIMESTAMPTZ,
  UNIQUE(user_id_a, user_id_b),
  CONSTRAINT ordered_pair  CHECK (user_id_a < user_id_b),
  CONSTRAINT valid_status  CHECK (status IN ('pending','accepted','blocked'))
);

CREATE INDEX friendships_a_idx ON public.friendships (user_id_a);
CREATE INDEX friendships_b_idx ON public.friendships (user_id_b);

-- ============================================================
-- LISTS (User Collections)
-- ============================================================
CREATE TABLE public.lists (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  is_public     BOOLEAN DEFAULT FALSE,
  cover_film_id UUID REFERENCES public.films(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.list_films (
  list_id    UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  film_id    UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  sort_order SMALLINT DEFAULT 0,
  note       TEXT,
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (list_id, film_id)
);

CREATE INDEX lists_user_idx     ON public.lists (user_id);
CREATE INDEX list_films_list_idx ON public.list_films (list_id, sort_order);

-- ============================================================
-- PUSH NOTIFICATION TOKENS
-- ============================================================
CREATE TABLE public.push_tokens (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  platform   TEXT DEFAULT 'android',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, token)
);

-- ============================================================
-- AVAILABILITY WATCH (Notify Me)
-- ============================================================
CREATE TABLE public.availability_watches (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  film_id      UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  country_code CHAR(2) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  notified_at  TIMESTAMPTZ,
  UNIQUE(user_id, film_id)
);

-- ============================================================
-- AI GENERATION QUEUE
-- ============================================================
CREATE TABLE public.ai_generation_queue (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type         TEXT NOT NULL,
  payload      JSONB NOT NULL,
  status       TEXT DEFAULT 'pending',
  attempts     SMALLINT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error        TEXT,
  CONSTRAINT valid_type   CHECK (type IN ('convince_me','commentary_pre','commentary_post','time_capsule','digest')),
  CONSTRAINT valid_status CHECK (status IN ('pending','processing','done','failed'))
);

CREATE INDEX ai_queue_status_idx ON public.ai_generation_queue (status, created_at);

-- ============================================================
-- CONVINCE ME CACHE
-- ============================================================
CREATE TABLE public.convince_me_cache (
  film_id    UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (film_id, user_id)
);

-- ============================================================
-- FILM VECTORS (for recommendation engine)
-- ============================================================
CREATE TABLE public.film_vectors (
  film_id        UUID PRIMARY KEY REFERENCES public.films(id) ON DELETE CASCADE,
  genre_vector   FLOAT8[] NOT NULL DEFAULT '{}',
  tone_score     FLOAT8 NOT NULL DEFAULT 0.0,
  pace_score     FLOAT8 NOT NULL DEFAULT 0.0,
  runtime_bucket SMALLINT,
  format_type    TEXT,
  keyword_vector FLOAT8[] DEFAULT '{}',
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER TASTE VECTORS (for recommendation engine)
-- ============================================================
CREATE TABLE public.user_taste_vectors (
  user_id          UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  genre_vector     FLOAT8[] NOT NULL DEFAULT '{}',
  tone_target      FLOAT8 NOT NULL DEFAULT 0.0,
  pace_target      FLOAT8 NOT NULL DEFAULT 0.0,
  keyword_affinity FLOAT8[] DEFAULT '{}',
  confidence       FLOAT8 NOT NULL DEFAULT 0.0,
  ratings_count    INTEGER NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REWATCH DELTAS (Rewatch Vault)
-- ============================================================
CREATE TABLE public.rewatch_deltas (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  film_id    UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  old_rating NUMERIC(3,1) NOT NULL,
  new_rating NUMERIC(3,1) NOT NULL,
  delta      NUMERIC(3,1) GENERATED ALWAYS AS (new_rating - old_rating) STORED,
  watch_date DATE,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WEEKLY DIGESTS
-- ============================================================
CREATE TABLE public.weekly_digests (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  content    JSONB NOT NULL,
  sent_at    TIMESTAMPTZ,
  opened_at  TIMESTAMPTZ,
  UNIQUE(user_id, week_start)
);

-- ============================================================
-- COMMENTARY CACHE
-- ============================================================
CREATE TABLE public.commentary_cache (
  film_id      UUID PRIMARY KEY REFERENCES public.films(id) ON DELETE CASCADE,
  pre_watch    TEXT,
  post_watch   TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERSON EDITORIAL CACHE (Director Rabbit Hole)
-- ============================================================
CREATE TABLE public.person_editorial_cache (
  person_id    UUID PRIMARY KEY REFERENCES public.persons(id) ON DELETE CASCADE,
  content      JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FRIEND ACTIVITIES (Activity Feed)
-- ============================================================
CREATE TABLE public.friend_activities (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  film_id    UUID REFERENCES public.films(id) ON DELETE SET NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_activity_type CHECK (type IN ('watched','rated','added_planned','collection_created','rewatch'))
);

CREATE INDEX friend_activities_user_idx ON public.friend_activities (user_id, created_at DESC);

CREATE TABLE public.activity_reactions (
  activity_id UUID NOT NULL REFERENCES public.friend_activities(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (activity_id, user_id)
);
