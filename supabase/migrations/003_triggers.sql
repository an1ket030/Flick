-- ============================================================
-- Migration 003: Triggers & Automation
-- ============================================================

-- ============================================================
-- Auto-update updated_at on row change
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_taste_profiles_updated_at
  BEFORE UPDATE ON public.taste_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_films_updated_at
  BEFORE UPDATE ON public.films
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_persons_updated_at
  BEFORE UPDATE ON public.persons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_ufe_updated_at
  BEFORE UPDATE ON public.user_film_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_taste_profile_updated_at
  BEFORE UPDATE ON public.taste_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Auto-create profile + taste profile on new user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _username TEXT;
BEGIN
  -- Derive username from email (part before @), sanitised
  _username := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  -- Ensure uniqueness by appending random suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) LOOP
    _username := _username || FLOOR(RANDOM() * 9000 + 1000)::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, country_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', _username),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'country_code'
  );

  INSERT INTO public.taste_profiles (user_id) VALUES (NEW.id);
  INSERT INTO public.user_taste_vectors (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Auto-create friend_activity when a film is rated/watched
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_film_entry_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- On insert of a watched entry
  IF TG_OP = 'INSERT' AND NEW.status = 'watched' THEN
    INSERT INTO public.friend_activities (user_id, type, film_id, metadata)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.rating IS NOT NULL THEN 'rated' ELSE 'watched' END,
      NEW.film_id,
      jsonb_build_object('rating', NEW.rating, 'rewatch_number', NEW.rewatch_number)
    );
  END IF;

  -- On update: if status changed to watched
  IF TG_OP = 'UPDATE' AND NEW.status = 'watched' AND OLD.status != 'watched' THEN
    INSERT INTO public.friend_activities (user_id, type, film_id, metadata)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.rating IS NOT NULL THEN 'rated' ELSE 'watched' END,
      NEW.film_id,
      jsonb_build_object('rating', NEW.rating, 'rewatch_number', NEW.rewatch_number)
    );
  END IF;

  -- On update: if planned status added
  IF TG_OP = 'INSERT' AND NEW.status = 'planned' THEN
    INSERT INTO public.friend_activities (user_id, type, film_id, metadata)
    VALUES (NEW.user_id, 'added_planned', NEW.film_id, '{}'::JSONB);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_film_entry_change
  AFTER INSERT OR UPDATE ON public.user_film_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_film_entry_activity();

-- ============================================================
-- Auto-update taste vector ratings count on new rating
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_ratings_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating IS NOT NULL THEN
    INSERT INTO public.user_taste_vectors (user_id, ratings_count, confidence)
    VALUES (
      NEW.user_id,
      1,
      LEAST(1.0, 0.15 + (1 * 0.04))
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      ratings_count = user_taste_vectors.ratings_count + 1,
      confidence = LEAST(1.0, 0.15 + ((user_taste_vectors.ratings_count + 1) * 0.04)),
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_rating_submitted
  AFTER INSERT ON public.user_film_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_ratings_count();
