-- ============================================================
-- Migration 005: Extended Taste Profile fields (Phase 2)
-- Adding director familiarity metrics to taste_profiles
-- ============================================================

ALTER TABLE public.taste_profiles
ADD COLUMN director_familiarity TEXT[] DEFAULT '{}';

-- Check if primary intent exists, if not add it (it should exist based on 001, but doing this defensively)
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                WHERE table_name='taste_profiles' AND column_name='primary_intent') THEN
    ALTER TABLE public.taste_profiles ADD COLUMN primary_intent TEXT;
  END IF;
END $$;
