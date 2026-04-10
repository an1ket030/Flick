-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- Enable RLS on all user-facing tables
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taste_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_film_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_picks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_films           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convince_me_cache    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_taste_vectors   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewatch_deltas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_digests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_reactions   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
-- Public can read basic profile info (username, display_name, avatar)
CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT USING (TRUE);
-- Users can only update their own profile
CREATE POLICY "profiles_own_update"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- TASTE PROFILES — strictly private
-- ============================================================
CREATE POLICY "taste_profiles_own_all"
  ON public.taste_profiles FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- USER FILM ENTRIES — private by default
-- Users can read their own entries.
-- Friends can read non-hidden entries (enforced at API level with extra filter)
-- ============================================================
CREATE POLICY "ufe_own_select"
  ON public.user_film_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ufe_own_insert"
  ON public.user_film_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ufe_own_update"
  ON public.user_film_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ufe_own_delete"
  ON public.user_film_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- DAILY PICKS — private
-- ============================================================
CREATE POLICY "daily_picks_own_all"
  ON public.daily_picks FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- MOOD SESSIONS — strictly private
-- ============================================================
CREATE POLICY "mood_sessions_own_all"
  ON public.mood_sessions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- RECOMMENDATION EVENTS
-- ============================================================
CREATE POLICY "rec_events_own_select"
  ON public.recommendation_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rec_events_own_insert"
  ON public.recommendation_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FRIENDSHIPS
-- ============================================================
-- Users can see friendships they are part of
CREATE POLICY "friendships_own_select"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id_a OR auth.uid() = user_id_b);
CREATE POLICY "friendships_own_insert"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = initiated_by);
CREATE POLICY "friendships_own_update"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_id_a OR auth.uid() = user_id_b);
CREATE POLICY "friendships_own_delete"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id_a OR auth.uid() = user_id_b);

-- ============================================================
-- LISTS
-- ============================================================
-- Public lists are visible to all; private lists only to owner
CREATE POLICY "lists_public_read"
  ON public.lists FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);
CREATE POLICY "lists_own_write"
  ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lists_own_update"
  ON public.lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "lists_own_delete"
  ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- LIST FILMS: inherit from parent list visibility
CREATE POLICY "list_films_read"
  ON public.list_films FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lists l
      WHERE l.id = list_films.list_id
        AND (l.is_public = TRUE OR l.user_id = auth.uid())
    )
  );
CREATE POLICY "list_films_write"
  ON public.list_films FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.lists l WHERE l.id = list_id AND l.user_id = auth.uid())
  );
CREATE POLICY "list_films_delete"
  ON public.list_films FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.lists l WHERE l.id = list_id AND l.user_id = auth.uid())
  );

-- ============================================================
-- PUSH TOKENS — private
-- ============================================================
CREATE POLICY "push_tokens_own_all"
  ON public.push_tokens FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- AVAILABILITY WATCHES — private
-- ============================================================
CREATE POLICY "availability_watches_own_all"
  ON public.availability_watches FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- CONVINCE ME CACHE — private
-- ============================================================
CREATE POLICY "convince_me_own_all"
  ON public.convince_me_cache FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- USER TASTE VECTORS — private
-- ============================================================
CREATE POLICY "taste_vectors_own_all"
  ON public.user_taste_vectors FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- REWATCH DELTAS — private
-- ============================================================
CREATE POLICY "rewatch_deltas_own_all"
  ON public.rewatch_deltas FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- WEEKLY DIGESTS — private
-- ============================================================
CREATE POLICY "weekly_digests_own_all"
  ON public.weekly_digests FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FRIEND ACTIVITIES
-- Friends can see each other's activities (API enforces friendship check)
-- ============================================================
CREATE POLICY "friend_activities_own_insert"
  ON public.friend_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "friend_activities_read"
  ON public.friend_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "friend_activities_own_delete"
  ON public.friend_activities FOR DELETE USING (auth.uid() = user_id);

-- ACTIVITY REACTIONS
CREATE POLICY "reactions_own_all"
  ON public.activity_reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reactions_read_all"
  ON public.activity_reactions FOR SELECT USING (TRUE);
