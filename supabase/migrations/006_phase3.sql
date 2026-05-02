-- ============================================================
-- Migration 006 — Phase 3: Signature Features
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 3.1 Rewatch Vault ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rewatch_deltas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  film_id     UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  old_rating  NUMERIC(3,1),
  new_rating  NUMERIC(3,1),
  delta       NUMERIC(3,1) GENERATED ALWAYS AS (new_rating - old_rating) STORED,
  watch_date  DATE DEFAULT CURRENT_DATE,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rewatch_deltas_user_idx ON public.rewatch_deltas (user_id);
CREATE INDEX IF NOT EXISTS rewatch_deltas_film_idx ON public.rewatch_deltas (film_id);

ALTER TABLE public.rewatch_deltas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rewatch deltas"
  ON public.rewatch_deltas FOR ALL USING (auth.uid() = user_id);

-- ── 3.3 Time Capsule Cache ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.time_capsule_cache (
  user_id       UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_year   SMALLINT NOT NULL,
  film_id       UUID REFERENCES public.films(id),
  ai_copy       TEXT,
  generated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.time_capsule_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own time capsule"
  ON public.time_capsule_cache FOR SELECT USING (auth.uid() = user_id);

-- ── 3.4 Director's Commentary Cache ───────────────────────
CREATE TABLE IF NOT EXISTS public.commentary_cache (
  film_id       UUID PRIMARY KEY REFERENCES public.films(id) ON DELETE CASCADE,
  pre_watch     TEXT,
  post_watch    TEXT,
  generated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Commentary is public read (not user-specific) — same copy for everyone
ALTER TABLE public.commentary_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read commentary"
  ON public.commentary_cache FOR SELECT USING (TRUE);

-- ── 3.5 Editorial Collections ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.editorial_collections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  film_ids    UUID[] NOT NULL DEFAULT '{}',
  cover_url   TEXT,
  active      BOOLEAN DEFAULT TRUE,
  sort_order  SMALLINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.editorial_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read editorial collections"
  ON public.editorial_collections FOR SELECT USING (active = TRUE);

-- ── 3.5 User Collections (lists) — already seeded in 001 ──
-- Ensure RLS if somehow missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lists' AND policyname = 'Users manage own lists'
  ) THEN
    CREATE POLICY "Users manage own lists"
      ON public.lists FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── Ensure birth_year exists on profiles (from PRD 001) ────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_year SMALLINT;

-- ── Seed 6 Editorial Collections ──────────────────────────
-- These use placeholder film UUID arrays — populate with real film IDs via an admin script
INSERT INTO public.editorial_collections (title, description, sort_order, active)
VALUES
  (
    'Modern Horror Masterclasses',
    'Six films that redefined fear. Slow-burn dread, psychological terror, and the monsters inside us.',
    1, TRUE
  ),
  (
    'The Criterion Essentials',
    'If cinema is a language, these films wrote its grammar. A starting point for serious film lovers.',
    2, TRUE
  ),
  (
    'Revenge of the Slow Burn',
    'Films that earn their endings. Patience will be rewarded.',
    3, TRUE
  ),
  (
    'Directors'' First Films',
    'Every master had a beginning. These debuts announced something new.',
    4, TRUE
  ),
  (
    'Under 90 Minutes, Over Everything',
    'Proof that concision is an art form. Every minute earns its place.',
    5, TRUE
  ),
  (
    'When Comedy Breaks Your Heart',
    'The films that made you laugh and then caught you completely off guard.',
    6, TRUE
  )
ON CONFLICT DO NOTHING;
