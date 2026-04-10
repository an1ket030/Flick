# FLICK — Development Phases Guide
### Practical task-by-task guide for building Flick phase by phase

> **Free-Tier-First Architecture**
> Every service referenced in this guide has a free tier sufficient for development and early production.
> Paid upgrades are only required when user scale demands it (noted where applicable).
> No credit card should be needed to ship Phases 0–3.

---

## FREE TIER SERVICE STACK

| Service | Free Tier Provider | What Free Gets You | Upgrade Trigger |
|---------|-------------------|-------------------|----------------|
| **Database (PostgreSQL)** | Supabase | 500 MB storage, 2 projects, 50K monthly active users | >500 MB data |
| **Auth** | Supabase Auth (built-in) | Unlimited users, Google/Apple OAuth, email magic links | Never for MVP |
| **File Storage** | Supabase Storage | 1 GB storage, 2 GB bandwidth/month | >1 GB media |
| **Backend API** | Render (free tier) | 1 web service, spins down after 15min inactivity | Paying users |
| **Web App** | Vercel (free) | Unlimited deploys, custom domain, edge network | Team features |
| **Mobile App** | Expo (free) | Unlimited builds via EAS (limited), OTA updates | >30 builds/month |
| **Full-text Search** | PostgreSQL `pg_trgm` | Built into Supabase — no extra service needed | >500K films indexed |
| **Redis / Cache** | Upstash Redis (free) | 10,000 commands/day, 256 MB | >10K daily ops |
| **AI Copy Generation** | Google Gemini API (free) | 15 RPM, 1M tokens/month (Gemini 1.5 Flash) | >1M tokens/month |
| **Push Notifications** | Firebase Cloud Messaging | Unlimited pushes, free forever | Never |
| **Email Sending** | Resend (free) | 3,000 emails/month, 1 custom domain | >3K emails/month |
| **Error Monitoring** | Sentry (free) | 5,000 errors/month, 1 project | >5K errors |
| **Analytics** | PostHog (free cloud) | 1M events/month, feature flags, A/B tests | >1M events |
| **CI/CD** | GitHub Actions (free) | 2,000 min/month (more than enough for this project) | Large team |
| **Streaming Data** | TMDb Watch Providers API | Free with attribution (replaces Watchmode) | Never |
| **Film Metadata** | TMDb API | Free, 40 requests/second | Never |
| **CDN** | Supabase Storage CDN | Included in free tier | Never for MVP |
| **Secrets Management** | GitHub Actions Secrets + .env | Free | Never |

> **Note:** Render free tier spins down after 15 minutes of inactivity (cold start ~30s).
> This is acceptable for development and early beta. Upgrade to Render Starter ($7/mo) when you have real users.

---

## PHASE 0 — FOUNDATION
**Duration:** Weeks 1–4 | **Goal:** Everything is set up. Zero user-facing code. Zero shortcuts.

### 0.1 Accounts & Access Setup
- [ ] Create a GitHub organisation: `flick-app` (or personal repo if solo)
- [ ] Create a monorepo: `flick-app/` with structure:
  ```
  flick-app/
  ├── apps/
  │   ├── mobile/          # React Native (Expo)
  │   └── web/             # Next.js
  ├── packages/
  │   ├── ui/              # Shared component library
  │   └── types/           # Shared TypeScript types
  ├── services/
  │   ├── api/             # Node.js/Express backend
  │   └── ml/              # Python FastAPI (recommendation engine)
  └── supabase/            # Supabase config, migrations, seed data
  ```
- [ ] Set up the monorepo tooling: install `pnpm` workspaces or `turborepo`
- [ ] Create Supabase project at supabase.com (free tier, note your project URL and anon key)
- [ ] Create a Render account at render.com (deploy backend here)
- [ ] Create a Vercel account at vercel.com (deploy web app here)
- [ ] Create a Firebase project at console.firebase.google.com (for FCM push notifications only)
- [ ] Create an Upstash account at upstash.com, create a Redis database (free tier)
- [ ] Register at tmdb.org/settings/api — get a free API Read Access Token
- [ ] Register at sentry.io — create a free project (Node.js + React Native)
- [ ] Register at posthog.com — create a free cloud project
- [ ] Register at resend.com — get a free API key, verify your sending domain
- [ ] Register at ai.google.dev — get a Gemini API key (free tier)

### 0.2 Supabase Database Schema
Run the following migrations in order in Supabase SQL Editor:

**Migration 001 — Core tables:**
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Users (managed by Supabase Auth, this extends it)
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

-- Taste profiles
CREATE TABLE public.taste_profiles (
  user_id         UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  format_prefs    JSONB DEFAULT '{}',
  region_prefs    JSONB DEFAULT '{}',
  pace_slider     FLOAT DEFAULT 0.5,
  tone_slider     FLOAT DEFAULT 0.5,
  genre_loves     INT[] DEFAULT '{}',
  genre_hates     INT[] DEFAULT '{}',
  adventurousness FLOAT DEFAULT 0.5,
  primary_intent  TEXT,
  onboarding_phase INT DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Films
CREATE TABLE public.films (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_id                INTEGER UNIQUE NOT NULL,
  imdb_id                TEXT,
  title                  TEXT NOT NULL,
  original_title         TEXT,
  release_year           SMALLINT,
  runtime_minutes        SMALLINT,
  original_language      CHAR(2),
  countries              TEXT[],
  genres                 INTEGER[],
  synopsis               TEXT,
  tagline                TEXT,
  poster_url             TEXT,
  backdrop_url           TEXT,
  tmdb_rating            FLOAT,
  tmdb_vote_count        INTEGER,
  keywords               TEXT[],
  content_rating         TEXT,
  adult                  BOOLEAN DEFAULT FALSE,
  metadata_quality_score FLOAT DEFAULT 0.0,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX films_title_trgm_idx ON public.films USING GIN (title gin_trgm_ops);
CREATE INDEX films_original_title_trgm_idx ON public.films USING GIN (original_title gin_trgm_ops);
CREATE INDEX films_tmdb_id_idx ON public.films (tmdb_id);
CREATE INDEX films_release_year_idx ON public.films (release_year);
CREATE INDEX films_genres_idx ON public.films USING GIN (genres);

-- Persons (directors, actors, etc.)
CREATE TABLE public.persons (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_person_id        INTEGER UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  profile_url           TEXT,
  known_for_department  TEXT,
  biography             TEXT,
  birthday              DATE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Film-person junction
CREATE TABLE public.film_persons (
  film_id        UUID REFERENCES public.films(id) ON DELETE CASCADE,
  person_id      UUID REFERENCES public.persons(id) ON DELETE CASCADE,
  role           TEXT NOT NULL,
  character_name TEXT,
  billing_order  SMALLINT,
  PRIMARY KEY (film_id, person_id, role)
);

-- User film entries (library)
CREATE TABLE public.user_film_entries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  film_id          UUID NOT NULL REFERENCES public.films(id),
  status           TEXT NOT NULL DEFAULT 'planned',
  rating           NUMERIC(3,1),
  personal_note    TEXT,
  date_watched     DATE,
  rewatch_number   SMALLINT DEFAULT 1,
  is_hidden        BOOLEAN DEFAULT FALSE,
  custom_tags      TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, film_id, rewatch_number),
  CONSTRAINT valid_status CHECK (status IN ('planned','watching','watched','paused','dropped')),
  CONSTRAINT valid_rating CHECK (rating IS NULL OR (rating >= 0.5 AND rating <= 10.0))
);

CREATE INDEX ufe_user_id_idx ON public.user_film_entries (user_id);
CREATE INDEX ufe_film_id_idx ON public.user_film_entries (film_id);
CREATE INDEX ufe_status_idx ON public.user_film_entries (user_id, status);

-- Streaming availability
CREATE TABLE public.streaming_availability (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  film_id      UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  country_code CHAR(2) NOT NULL,
  platform_id  INTEGER NOT NULL,
  platform_name TEXT NOT NULL,
  stream_type  TEXT NOT NULL,
  stream_url   TEXT,
  verified_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(film_id, country_code, platform_id, stream_type)
);

-- Daily picks
CREATE TABLE public.daily_picks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pick_date       DATE NOT NULL,
  film_id         UUID NOT NULL REFERENCES public.films(id),
  confidence_score FLOAT,
  convince_me     JSONB,
  action_taken    TEXT,
  dismissed_at    TIMESTAMPTZ,
  dismiss_reason  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pick_date)
);

-- Mood pick sessions
CREATE TABLE public.mood_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood_selected   TEXT NOT NULL,
  filters_applied JSONB,
  films_returned  UUID[],
  film_chosen     UUID REFERENCES public.films(id),
  session_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendation events (for feedback loop)
CREATE TABLE public.recommendation_events (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  film_id            UUID REFERENCES public.films(id),
  rec_type           TEXT NOT NULL,
  algorithm_version  TEXT,
  confidence_score   FLOAT,
  shown_at           TIMESTAMPTZ DEFAULT NOW(),
  action_taken       TEXT,
  dismiss_reason     TEXT
);

-- Friends
CREATE TABLE public.friendships (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_a    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id_b    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending',
  initiated_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  accepted_at  TIMESTAMPTZ,
  UNIQUE(user_id_a, user_id_b),
  CONSTRAINT ordered_pair CHECK (user_id_a < user_id_b),
  CONSTRAINT valid_status CHECK (status IN ('pending','accepted','blocked'))
);

-- User lists (collections)
CREATE TABLE public.lists (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  is_public    BOOLEAN DEFAULT FALSE,
  cover_film_id UUID REFERENCES public.films(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.list_films (
  list_id    UUID REFERENCES public.lists(id) ON DELETE CASCADE,
  film_id    UUID REFERENCES public.films(id),
  sort_order SMALLINT,
  note       TEXT,
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (list_id, film_id)
);
```

**Migration 002 — Row Level Security:**
```sql
-- Enable RLS on all user-facing tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_film_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only (plus public read for username/display_name)
CREATE POLICY "Public profiles are viewable by all"
  ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Library entries: private by default, only owner can CRUD
CREATE POLICY "Users can view own library"
  ON public.user_film_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own library"
  ON public.user_film_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own library"
  ON public.user_film_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own library"
  ON public.user_film_entries FOR DELETE USING (auth.uid() = user_id);

-- Taste profiles: private
CREATE POLICY "Users can manage own taste profile"
  ON public.taste_profiles FOR ALL USING (auth.uid() = user_id);
```

- [ ] Run migration 001 in Supabase SQL Editor
- [ ] Run migration 002 in Supabase SQL Editor
- [ ] Verify all tables are created in Supabase Table Editor
- [ ] Enable Supabase Realtime on `friendships` table (for live friend request notifications)

### 0.3 TMDb Data Sync Script
- [ ] Create `services/api/scripts/sync-tmdb.ts` — fetches popular/top-rated films and writes to Supabase
- [ ] Seed 5,000 films initially (enough for Phase 1 testing)
- [ ] Compute `metadata_quality_score` for each film during sync
- [ ] Store poster URLs as TMDb paths (prefix with `https://image.tmdb.org/t/p/w500/`)
- [ ] Schedule sync: use GitHub Actions scheduled workflow (free) — runs nightly at 2am UTC
- [ ] Test film sync with 100 films in local dev first, then run full 5K seed

### 0.4 Backend API (Render)
- [ ] Scaffold `services/api/` as an Express + TypeScript project
- [ ] Install: `express`, `@supabase/supabase-js`, `zod` (validation), `jsonwebtoken`, `cors`, `helmet`
- [ ] Create `src/index.ts` entry point with basic health check route `GET /health`
- [ ] Configure environment variables (in Render dashboard later):
  ```
  SUPABASE_URL=
  SUPABASE_SERVICE_ROLE_KEY=
  UPSTASH_REDIS_REST_URL=
  UPSTASH_REDIS_REST_TOKEN=
  TMDB_API_READ_TOKEN=
  GEMINI_API_KEY=
  RESEND_API_KEY=
  SENTRY_DSN=
  NODE_ENV=production
  ```
- [ ] Push to GitHub → connect Render to the `services/api/` directory → deploy
- [ ] Confirm `GET /health` returns 200 from Render URL
- [ ] **Free tier note:** Render spins down after 15min. Add a UptimeRobot ping every 14min to keep it warm (UptimeRobot free tier: 50 monitors)

### 0.5 Mobile App Scaffold (Expo)
- [ ] `npx create-expo-app apps/mobile --template expo-template-blank-typescript`
- [ ] Install Expo Router: `npx expo install expo-router`
- [ ] Set up tab navigation structure:
  ```
  apps/mobile/app/
  ├── (tabs)/
  │   ├── index.tsx          # Home
  │   ├── explore.tsx        # Explore
  │   ├── search.tsx         # Search
  │   ├── library.tsx        # Library
  │   └── profile.tsx        # Profile
  ├── film/[id].tsx           # Film detail
  ├── onboarding/            # Onboarding screens
  └── _layout.tsx            # Root layout
  ```
- [ ] Install Supabase client: `npx expo install @supabase/supabase-js`
- [ ] Install navigation: `expo-router` (already above) + `react-native-safe-area-context`
- [ ] Install animation: `react-native-reanimated`
- [ ] Install image: `expo-image`
- [ ] Set up `packages/ui/` shared component library (used by both mobile and web)
- [ ] Create placeholder screens for all 5 tabs — just a title text
- [ ] Confirm app runs on:
  - Local: `npx expo start` → press `i` for iOS simulator, `a` for Android
  - Physical device: Expo Go app (scan QR code)

### 0.6 Design System Implementation
- [ ] Set up fonts in Expo: `npx expo install expo-font @expo-google-fonts/inter @expo-google-fonts/playfair-display`
- [ ] Create `packages/ui/src/tokens.ts` with all colour, typography, spacing tokens from PRD Section 4
- [ ] Build base components in `packages/ui/src/components/`:
  - [ ] `FilmPoster.tsx` — poster with skeleton loading
  - [ ] `FilmCard.tsx` — horizontal card (poster + title + metadata)
  - [ ] `RatingBadge.tsx` — numeric rating display
  - [ ] `Button.tsx` — primary, secondary, ghost, danger variants
  - [ ] `TextInput.tsx` — with label, error, helper states
  - [ ] `SkeletonLoader.tsx` — animated loading placeholder
  - [ ] `EmptyState.tsx` — zero-data screen with copy + icon
  - [ ] `PlatformBadge.tsx` — streaming platform logo chip
  - [ ] `GenreChip.tsx` — tappable genre label
  - [ ] `BottomSheet.tsx` — modal sheet (use `@gorhom/bottom-sheet`)

### 0.7 CI/CD Pipeline
- [ ] Create `.github/workflows/ci.yml`:
  - Runs on every PR to `main`
  - Steps: `pnpm install` → `pnpm lint` → `pnpm typecheck` → `pnpm test`
- [ ] Create `.github/workflows/deploy-api.yml`:
  - Runs on push to `main`
  - Triggers Render deploy hook (set in Render dashboard → copy hook URL → add to GitHub secret)
- [ ] Create `.github/workflows/sync-tmdb.yml`:
  - Runs nightly at 2am UTC via `schedule: cron`
  - Calls the TMDb sync script via a Render webhook or direct Node invocation
- [ ] Add branch protection on `main`: require CI to pass before merge

### Phase 0 Done Checklist
- [ ] Supabase project live with all tables and RLS policies
- [ ] 5,000 films seeded in the database
- [ ] Backend API deployed to Render, `/health` returns 200
- [ ] Mobile app runs on simulator and physical device via Expo Go
- [ ] All 5 tab placeholders visible in the app
- [ ] All base UI components built and rendering
- [ ] CI pipeline runs and passes on every PR
- [ ] No secrets committed to the repository

---

## PHASE 1 — CORE PRODUCT
**Duration:** Weeks 5–12 | **Goal:** A real app a real user can use. Onboarding → Library → Daily Pick.

### 1.1 Authentication (Weeks 5–6)

**Using Supabase Auth (no additional service needed):**
- [ ] Enable Email/Password auth in Supabase Dashboard → Auth → Providers
- [ ] Enable Google OAuth:
  - Create OAuth app in Google Cloud Console (free)
  - Add client ID + secret to Supabase Auth → Google provider
- [ ] Enable Apple Sign In:
  - Requires Apple Developer account ($99/yr — only needed before App Store submission)
  - For Phase 1 dev: skip Apple, use Email + Google only
- [ ] In the mobile app, implement screens:
  - [ ] `app/auth/welcome.tsx` — welcome screen with Sign in options
  - [ ] `app/auth/register.tsx` — email/password register form
  - [ ] `app/auth/login.tsx` — email/password login form
  - [ ] `app/auth/forgot-password.tsx` — password reset screen
- [ ] Wire up Supabase Auth functions:
  - `supabase.auth.signUp()` → register
  - `supabase.auth.signInWithPassword()` → login
  - `supabase.auth.signInWithOAuth({ provider: 'google' })` → Google
  - `supabase.auth.resetPasswordForEmail()` → forgot password
- [ ] On successful register: auto-create row in `public.profiles` and `public.taste_profiles` via Supabase DB trigger:
  ```sql
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'display_name');
    INSERT INTO public.taste_profiles (user_id) VALUES (new.id);
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  ```
- [ ] Implement auth state listener: redirect to onboarding if no taste profile, else to home
- [ ] Implement token refresh (Supabase handles this automatically via `supabase.auth.onAuthStateChange()`)
- [ ] Implement logout: `supabase.auth.signOut()`
- [ ] Test: register → verify email → login → logout → refresh works

### 1.2 Onboarding Flow (Weeks 7–8)

- [ ] Create `app/onboarding/` directory with 5 screen files
- [ ] Build progress bar component: `OnboardingProgress.tsx` (5 segments)
- [ ] Implement Screen 1 — Format Preferences:
  - [ ] 2×2 grid: Live Action, Animation, Anime, All
  - [ ] Multi-select state, persist to `taste_profiles.format_prefs`
- [ ] Implement Screen 2 — Region Comfort:
  - [ ] Scrollable grid with 10 region tiles
  - [ ] All selected by default (user deselects unwanted)
  - [ ] Persist to `taste_profiles.region_prefs`
- [ ] Implement Screen 3 — Pace & Tone:
  - [ ] Two custom sliders (use `@miblanchard/react-native-slider` — free)
  - [ ] Persist to `taste_profiles.pace_slider` and `taste_profiles.tone_slider`
- [ ] Implement Screen 4 — Genre Loves & Hates:
  - [ ] 24-genre scrollable grid
  - [ ] 3-state cycle: neutral → love (gold) → hate (red/muted) → neutral
  - [ ] Require at least 1 love to proceed
  - [ ] Persist to `taste_profiles.genre_loves` and `taste_profiles.genre_hates`
- [ ] Implement Screen 5 — Seed Film Ratings:
  - [ ] Load 8 seed films from a curated list (hardcoded in Phase 1 — dynamic in Phase 2)
  - [ ] Custom 10-point rating tap input + "Haven't seen it" button
  - [ ] Require rating/skip of at least 4 films
  - [ ] Write rated films to `user_film_entries` with `status: 'watched'`
- [ ] Build Taste Profile Card: template-driven summary (no AI yet)
- [ ] Implement "Skip to Flick" CTA — skips remaining steps, sets `onboarding_phase = 1`
- [ ] Mark `onboarding_phase = 1` on completion, redirect to home

### 1.3 Film Search & Detail (Weeks 9–10)

**Search (using PostgreSQL `pg_trgm` — no Elasticsearch needed):**
- [ ] Build search API endpoint in `services/api/src/routes/films.ts`:
  ```
  GET /api/films/search?q=parasite&genre_ids=18&year_min=2010
  ```
- [ ] Use `pg_trgm` similarity query in Supabase:
  ```sql
  SELECT * FROM films
  WHERE title ILIKE '%' || $1 || '%'
     OR original_title ILIKE '%' || $1 || '%'
  ORDER BY similarity(title, $1) DESC
  LIMIT 20;
  ```
- [ ] Cache search results in Upstash Redis: key `search:{q}:{filters}`, TTL 1 hour
- [ ] Build search screen UI:
  - [ ] Search bar with 300ms debounce
  - [ ] Autocomplete: top 5 results as user types
  - [ ] Results grid with film cards
  - [ ] Filter panel: year, genre, country, language
  - [ ] Recent searches (stored in AsyncStorage)
  - [ ] Empty state + "Not finding it?" feedback option

**Film Detail Page:**
- [ ] Build `app/film/[id].tsx` screen
- [ ] Sections to implement:
  - [ ] Hero: backdrop, title, year, runtime, country flags, TMDb rating
  - [ ] Streaming: fetch from `streaming_availability` for user's country
  - [ ] Library status selector: bottom sheet with 5 status options
  - [ ] Rating input: custom 10-point picker (only when status = Watched)
  - [ ] Synopsis: collapsed to 3 lines with "Read more" expand
  - [ ] Cast: top 6 cast members with avatars, tappable
  - [ ] Crew: director, writer, DP — tappable (opens Person screen stub in Phase 4)
  - [ ] Genres + keywords chips
  - [ ] Community rating (TMDb only for Phase 1)
  - [ ] Similar films row (content-based query)
- [ ] Convince Me card (template version for Phase 1):
  - Generate from film metadata: Genre + Tone estimate + synopsis first sentence
  - No AI call yet — pure template

### 1.4 Library (Weeks 9–10, cont.)

- [ ] Build Library screen with 3 views (tab switcher):
  - [ ] Grid view: poster wall using `FlashList` (performant list from Shopify)
  - [ ] List view: compact rows with title + year + director + rating
  - [ ] Stats view: computed dashboard (see stats section below)
- [ ] Status filter tabs: All / Planned / Watching / Watched / Paused / Dropped
- [ ] Sort menu: date added, date watched, rating asc/desc, title, year
- [ ] In-library search bar
- [ ] Library stats computation (use Supabase function or compute in API):
  - Total films watched, total hours, average rating
  - Films this year, films this month
  - Top genre, top director, top country
  - Rating distribution histogram data
  - Rewatch rate, favourite decade
- [ ] Film entry detail sheet (when library card is long-pressed):
  - [ ] Status picker
  - [ ] Rating input
  - [ ] Personal note text field
  - [ ] Tags input (chip-style, max 10)
  - [ ] Watch date picker
  - [ ] "Hide from friends" toggle
  - [ ] Delete entry button

**Letterboxd Import:**
- [ ] Build `app/settings/import.tsx` import screen
- [ ] File picker using `expo-document-picker`
- [ ] Upload CSV to API: `POST /api/library/import/letterboxd`
- [ ] Parse CSV in API: map Letterboxd columns → Flick fields (rating × 2 to convert 5pt → 10pt)
- [ ] Match each row: TMDb search by title + year → store best match
- [ ] Flag low-confidence matches (similarity < 0.8) for user review
- [ ] Run as background job: return job ID immediately, poll status
- [ ] Progress screen: `app/settings/import-progress.tsx` — real-time progress via Supabase Realtime
- [ ] Post-import review screen: show flagged matches, let user confirm or skip each

### 1.5 Daily Pick v1 & Home Screen (Weeks 11–12)

**Daily Pick Algorithm (Layer 1 — content-based, server computed):**
- [ ] Create `services/api/src/services/recommendation.ts`
- [ ] Layer 1 scoring function — inputs: user taste profile, films not in library:
  ```typescript
  function scoreFilm(film: Film, taste: TasteProfile): number {
    const genreMatch = computeGenreOverlap(film.genres, taste.genre_loves, taste.genre_hates);
    const toneMatch = gaussianMatch(estimateTone(film), taste.tone_slider);
    const paceMatch = gaussianMatch(estimatePace(film), taste.pace_slider);
    const regionMatch = computeRegionMatch(film.countries, taste.region_prefs);
    return (0.35 * genreMatch) + (0.25 * toneMatch) + (0.20 * paceMatch) + (0.20 * regionMatch);
  }
  ```
- [ ] Build nightly pick computation job (GitHub Actions cron):
  - For each active user with `onboarding_phase >= 1`
  - Score top 1,000 candidate films
  - Apply exclusions (in library, shown last 30 days, hated genres)
  - Cache top 10 candidates in Upstash Redis: `daily_pick:{userId}:{date}`
  - TTL: 24 hours
- [ ] Daily pick endpoint: `GET /api/recommendations/daily-pick`
  - Return pre-computed pick from Redis cache
  - If cache miss: compute on-demand (slower but correct)
- [ ] Confidence level:
  - `< 5 ratings` → return 3 picks (trio mode)
  - `5-20 ratings` → return 1 pick (medium confidence)
  - `> 20 ratings` → return 1 pick (high confidence, full Convince Me)
- [ ] Dismissal: `POST /api/recommendations/daily-pick/:filmId/dismiss`
  - Log dismiss reason
  - Return next film from cached top-10
  - Max 3 dismissals per day

**Home Screen:**
- [ ] Build `app/(tabs)/index.tsx` — Home
- [ ] Components:
  - [ ] Greeting header with user's display name + current time of day
  - [ ] Daily Pick full-width card with Convince Me template
  - [ ] "Continue watching" row (if Watching/Paused films exist)
  - [ ] "Because you loved [Film]" row — top 5 similar films by genre/tone match
  - [ ] "New on your platforms" row — streaming availability + taste match
  - [ ] Bottom navigation (Expo Router handles this with tab layout)

### Phase 1 Done Checklist
- [ ] User can register, verify email, log in, log out
- [ ] Onboarding 5 screens complete, data persisted
- [ ] Search returns results in <500ms
- [ ] Film detail page loads all sections correctly
- [ ] Library CRUD (add, update status, rate, note, tag, hide, delete)
- [ ] Letterboxd CSV import working for 100/500/1000-film files
- [ ] Daily Pick shows on home for all onboarded users
- [ ] Dismissal with reason, replacement served instantly
- [ ] No film in user's library ever appears as Daily Pick
- [ ] Library stats computing correctly
- [ ] App runs without crash on iOS 16+ and Android 12+
- [ ] All API routes returning correct responses
- [ ] Sentry error tracking live and capturing events

---

## PHASE 2 — INTELLIGENCE
**Duration:** Weeks 13–20 | **Goal:** Make the recommendations genuinely good. Add AI copy, Mood Pick, Predictions.

### 2.1 Extended Onboarding & Taste Profile (Weeks 13–14)

- [ ] Build onboarding Phase 2 screens (accessible from Profile → "Fine-tune my taste"):
  - [ ] Screen 6–7: Extended seed film ratings (personalised to Phase 1 preferences)
  - [ ] Screen 8: Director familiarity — rapid-fire 30 director names (tap to know)
  - [ ] Screen 9: Primary intent — 4 options (transported / think / feel / fun)
- [ ] Regenerate Taste Profile Card with richer copy after Phase 2 completion
- [ ] Make Taste Profile card editable from Profile screen
- [ ] Store `primary_intent` in `taste_profiles` table
- [ ] Refactor seed film selection to be dynamic (based on Phase 1 answers, not hardcoded)

### 2.2 Film Vector System (Weeks 13–14)

- [ ] Add `film_vectors` table to Supabase:
  ```sql
  CREATE TABLE public.film_vectors (
    film_id        UUID PRIMARY KEY REFERENCES public.films(id),
    genre_vector   FLOAT8[] NOT NULL,
    tone_score     FLOAT8 NOT NULL DEFAULT 0.0,
    pace_score     FLOAT8 NOT NULL DEFAULT 0.0,
    runtime_bucket SMALLINT,
    format_type    TEXT,
    keyword_vector FLOAT8[],
    updated_at     TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Add `user_taste_vectors` table to Supabase:
  ```sql
  CREATE TABLE public.user_taste_vectors (
    user_id          UUID PRIMARY KEY REFERENCES public.profiles(id),
    genre_vector     FLOAT8[] NOT NULL DEFAULT '{}',
    tone_target      FLOAT8 NOT NULL DEFAULT 0.0,
    pace_target      FLOAT8 NOT NULL DEFAULT 0.0,
    keyword_affinity FLOAT8[],
    confidence       FLOAT8 NOT NULL DEFAULT 0.0,
    ratings_count    INTEGER NOT NULL DEFAULT 0,
    updated_at       TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Build vector computation script — runs after each new rating:
  - Update `user_taste_vectors` using EMA formula (see PRD Section 7.3)
  - Update confidence score: `min(1.0, 0.15 + (ratings_count × 0.04))`
- [ ] Run bulk vector recomputation for all existing films (GitHub Actions, one-time)
- [ ] Wire vector update trigger: when `user_film_entries` rating changes → recompute user taste vector

### 2.3 Mood Pick (Weeks 15–16)

- [ ] Create mood pick API endpoint: `GET /api/recommendations/mood`
  - Query params: `mood`, `max_runtime`, `language`, `platforms`
- [ ] Implement mood scoring function (see PRD Section 7.8 mood table)
- [ ] Cache mood results in Upstash Redis: `mood:{userId}:{mood}:{filters}`, TTL 4 hours
- [ ] Build Mood Pick UI:
  - [ ] Entry point on Home screen: "Quick pick by mood" CTA button
  - [ ] 8-mood 2×4 grid — each tile with distinct visual tint + label + sub-label
  - [ ] Optional filters: Runtime pill selector, Language toggle, Platform toggle
  - [ ] Results screen: exactly 3 film cards with full Convince Me
  - [ ] Persist filter choices between sessions (Supabase user prefs or AsyncStorage)
- [ ] Log mood sessions to `mood_sessions` table

### 2.4 AI Convince Me & Gemini Integration (Weeks 17–18)

**Using Gemini 1.5 Flash API (free tier: 15 RPM, 1M tokens/month):**
- [ ] Create `services/api/src/services/gemini.ts` service wrapper
- [ ] Implement `generateConvinceMe(film, userTaste)` function:
  - Construct prompt with film metadata + user's top 3 rated genres + primary intent
  - Call Gemini 1.5 Flash (cheapest/fastest — also free tier)
  - Parse response into `{ hook, twist, personalReason }` object
  - Validate: word count, no spoiler keywords, title/director hallucination check
- [ ] Create `convince_me_cache` table in Supabase:
  ```sql
  CREATE TABLE public.convince_me_cache (
    film_id    UUID REFERENCES public.films(id),
    user_id    UUID REFERENCES public.profiles(id),
    content    JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (film_id, user_id)
  );
  ```
- [ ] Cache all generated copy: check cache before calling Gemini
- [ ] Implement fallback: if Gemini call fails or times out → serve template copy
- [ ] Rate limiting: Gemini free tier = 15 RPM. Queue AI generation requests via Upstash Queue or simple DB queue table:
  ```sql
  CREATE TABLE public.ai_generation_queue (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type       TEXT NOT NULL,       -- 'convince_me', 'commentary_pre', etc.
    payload    JSONB NOT NULL,
    status     TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
  );
  ```
- [ ] Process queue in a background worker (Render cron job — free tier supports 1 cron)

### 2.5 Your Predictions & Explore Tab (Weeks 17–18)

- [ ] Build predictions endpoint: `GET /api/recommendations/predictions`
  - Requires `ratings_count >= 15` (else return 403 with min_ratings hint)
  - Use cosine similarity between user's genre/tone taste vector and film vectors
  - Return top 20 predicted-love films + Your Outliers list
- [ ] Build Explore tab `app/(tabs)/explore.tsx`:
  - [ ] Sections (shown in order, conditionally based on data availability):
    - Your Predictions (if ≥15 ratings)
    - Mood Pick entry CTA
    - Because You Loved [Film]
    - Hidden Gems (TMDb rating ≥7.5, vote_count <50,000)
    - New Releases (last 90 days)
  - [ ] Each section is a `SectionRow` component: title + subtitle + horizontal film scroll

### 2.6 Push Notifications Setup (Weeks 19–20)

**Using Firebase Cloud Messaging (FCM) — free forever:**
- [ ] Set up Firebase project at console.firebase.google.com
- [ ] Add `@react-native-firebase/messaging` to Expo app (use Expo's Firebase plugin)
- [ ] Register device token on app open: `POST /api/notifications/register-token`
- [ ] Store tokens in `push_tokens` table:
  ```sql
  CREATE TABLE public.push_tokens (
    user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    token      TEXT NOT NULL,
    platform   TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, token)
  );
  ```
- [ ] Build notification sending service in API using Firebase Admin SDK (free)
- [ ] Implement notification triggers:
  - Daily Pick ready (push at 8am user local time)
  - Friend request received
  - Time Capsule ready (Phase 3 — set up trigger now)

### Phase 2 Done Checklist
- [ ] Film vectors computed for all 5,000+ seeded films
- [ ] User taste vectors updating on every new rating
- [ ] Mood Pick returns 3 relevant films in <2 seconds
- [ ] AI Convince Me generating and caching properly
- [ ] Gemini fallback to template copy verified (tested by temporarily killing Gemini key)
- [ ] Your Predictions visible for users with ≥15 ratings
- [ ] Explore tab rendering all sections with correct, personalised data
- [ ] Push notifications arriving on device for Daily Pick
- [ ] A/B test framework: PostHog feature flags controlling template vs AI Convince Me

---

## PHASE 3 — SIGNATURE FEATURES
**Duration:** Weeks 21–28 | **Goal:** The features that make Flick feel unique and irreplaceable.

### 3.1 Rewatch Vault (Weeks 21–22)
- [ ] Add `rewatch_deltas` table:
  ```sql
  CREATE TABLE public.rewatch_deltas (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES public.profiles(id),
    film_id     UUID REFERENCES public.films(id),
    old_rating  NUMERIC(3,1),
    new_rating  NUMERIC(3,1),
    delta       NUMERIC(3,1),
    watch_date  DATE,
    note        TEXT
  );
  ```
- [ ] Build vault query: films with `rating ≥ 8.5`, `status = watched`, `date_watched < NOW() - INTERVAL '12 months'`
- [ ] Build `app/library/vault.tsx` screen with vault film list
- [ ] Write 6 prompt copy templates, select by film age + rating combination
- [ ] Re-rating flow: detect if film already watched → create new entry → show delta card
- [ ] Wire delta into recommendation engine weight

### 3.2 Blind Spot Finder (Weeks 23–24)
- [ ] Build blind spot query (Supabase function or API):
  - Films with TMDb rating ≥7.5 AND vote_count ≥50,000
  - In same genre cluster as user's high-rated films
  - NOT in user's library at any status
  - `metadata_quality_score ≥ 0.6`
- [ ] Rank by: `cultural_significance × genre_alignment × predicted_rating`
- [ ] Build `app/explore/blind-spots.tsx` screen with 12 film cards
- [ ] "We have questions" copy: template-driven with director/genre substitution
- [ ] "Add to watchlist" 1-tap action directly on blind spot card
- [ ] Refresh Blind Spots within 1 hour of new rating (invalidate cache)

### 3.3 Time Capsule (Weeks 25–26)
- [ ] Add `birth_year` to `task: verify this is in profiles table from Phase 1 migration`
- [ ] Build time capsule endpoint: `GET /api/recommendations/time-capsule`
  - Target year = user's birth year (or `taste_profiles.capsule_year` override)
  - Filter: `release_year = target_year AND tmdb_vote_count ≥ 10,000`
  - Score through taste profile, pick #1 not in library
- [ ] Generate framing copy with Gemini: year's cinema context + this film's significance
- [ ] Create GitHub Actions monthly cron (1st of each month) to pre-compute and cache time capsules
- [ ] Build `app/home/time-capsule.tsx` — special full-screen card (only shown on 1st of month)
- [ ] Build share card: design a shareable image layout using `react-native-view-shot`
- [ ] Trigger FCM push notification on 1st of month: "Your [year] Time Capsule is ready"

### 3.4 Director's Commentary (Weeks 25–26)
- [ ] Build 2 AI generation functions using Gemini:
  - `generatePreWatchCommentary(film)` — 150–200 words, no spoilers, thematic focus
  - `generatePostWatchCommentary(film)` — 300–400 words, deeper analysis, scene references
- [ ] Cache both in `commentary_cache` table:
  ```sql
  CREATE TABLE public.commentary_cache (
    film_id      UUID PRIMARY KEY REFERENCES public.films(id),
    pre_watch    TEXT,
    post_watch   TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Add "Watch it better" section to Film Detail page:
  - Pre-watch note always visible if film is in library
  - Post-watch note locked: shows locked state if status ≠ Watched, unlocks on status change
- [ ] Server validates post-watch access: `user_film_entries.status = 'watched'` required
- [ ] Generate commentary in queue (same AI queue from Phase 2) — triggered on first request, cached thereafter

### 3.5 Mood History & Collections (Weeks 27–28)
- [ ] Build `app/profile/mood-history.tsx`:
  - Timeline of all mood sessions from `mood_sessions` table
  - Shows mood selected, date, which film (if any) was chosen
  - Private — never visible to anyone else
- [ ] Build Collections (User Lists) screens:
  - [ ] `app/profile/collections/index.tsx` — list of user's collections
  - [ ] `app/profile/collections/[id].tsx` — collection detail with films
  - [ ] `app/profile/collections/create.tsx` — create/edit collection
  - [ ] Add "Add to collection" option in film entry long-press menu
- [ ] Build editorial Themed Collections (6 pre-curated, admin-defined):
  - Store in `editorial_collections` table with curated film lists
  - Shown in Explore tab as "Staff Picks" style section

### Phase 3 Done Checklist
- [ ] Rewatch Vault showing correct films with personality copy
- [ ] Re-rating creates new entry, delta card shows comparison
- [ ] Blind Spot Finder returning 12 personalised results
- [ ] Films added to Planned list disappear from Blind Spots
- [ ] Time Capsule generated and cached monthly for all users
- [ ] Share card renders and is shareable via iOS/Android share sheet
- [ ] Director's Commentary pre/post-watch generated and cached
- [ ] Post-watch locks enforced server-side (cannot be bypassed)
- [ ] Mood History showing correct timeline
- [ ] User can create, edit, and delete collections

---

## PHASE 4 — SOCIAL LAYER
**Duration:** Weeks 29–36 | **Goal:** Connect users. Friend activity, Movie Night Matcher, Person pages.

### 4.1 Friends System (Weeks 29–30)
- [ ] Friends API routes:
  - `GET /api/social/friends` — friend list
  - `POST /api/social/friends/request` — send request (by username)
  - `POST /api/social/friends/request/:id/accept`
  - `DELETE /api/social/friends/request/:id` — decline/cancel
  - `DELETE /api/social/friends/:friendId` — unfriend
  - `POST /api/social/friends/:userId/block`
- [ ] Build friends screens:
  - [ ] `app/profile/friends/index.tsx` — friends list
  - [ ] `app/profile/friends/search.tsx` — search users by username
  - [ ] `app/profile/friends/requests.tsx` — incoming/outgoing requests
  - [ ] `app/profile/friends/[friendId]/privacy.tsx` — per-friend visibility settings
- [ ] Friend request FCM notification
- [ ] Visibility settings (per-friendship, stored in `friendships` JSONB column):
  - Can see: ratings, watchlist, recent watches, collections
  - Default: all visible (user opts out per friendship)
- [ ] Privacy enforcement: all friend-visible library queries filter `is_hidden = false`

### 4.2 Activity Feed (Weeks 31–32)
- [ ] Create `friend_activities` table:
  ```sql
  CREATE TABLE public.friend_activities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES public.profiles(id),
    type        TEXT NOT NULL,  -- 'watched', 'rated', 'added_planned', 'collection_created'
    film_id     UUID REFERENCES public.films(id),
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Write activity on: film status change, rating submitted, collection published
- [ ] Build `app/profile/friends/activity.tsx`:
  - Chronological feed of friends' activities
  - Each item: avatar + action text + film poster thumbnail
  - Emoji reaction row (👍❤️😮🤣😢) — one reaction per user per activity
- [ ] Activity feed uses Supabase Realtime for live updates (enabled in Phase 0)

### 4.3 Movie Night Matcher (Weeks 33–34)
- [ ] Build Matcher API: `POST /api/social/matcher`
  - Input: `{ friendIds, mood?, maxRuntime?, languagePref?, platforms?, conflictMode }`
  - Compute top-500 for each user, find intersection
  - Score by group min-score × overlap bonus
  - Return top 5 results (top 3 for Conflict Mode)
  - Cache per unique user-set + filters for 6 hours
- [ ] Build Matcher UI:
  - [ ] `app/social/matcher/index.tsx` — friend selector screen
  - [ ] `app/social/matcher/filters.tsx` — mood + runtime + platform filters
  - [ ] `app/social/matcher/results.tsx` — 5 film cards with group score + individual scores
  - [ ] Conflict Mode toggle on results screen
- [ ] Entry from Home screen: "Pick for tonight" CTA button
- [ ] Entry from Profile → Friends → specific friend: "Watch something together" button

### 4.4 Person Pages (Weeks 35–36)
- [ ] Build `app/person/[id].tsx`:
  - [ ] Hero: name, photo, known field
  - [ ] Biography (collapsed)
  - [ ] All films as director / as actor (separate tabs)
  - [ ] Watchlist/watched stats from user's own library
- [ ] Director Rabbit Hole section (only for directors with ≥10 films in DB):
  - AI-generated "where to start" guide using Gemini
  - "Why they matter" paragraph
  - "Your gap" — films by this director not in user's library
  - Cache in `person_editorial_cache` table

### Phase 4 Done Checklist
- [ ] Friend requests can be sent, accepted, declined
- [ ] Friends cannot see hidden films under any condition
- [ ] Per-friend visibility controls working
- [ ] Activity feed showing friend activity in real time
- [ ] Emoji reactions work, persist, and are visible to the reacted-on user
- [ ] Matcher running in <5 seconds for groups up to 6
- [ ] Conflict Mode returning anti-overlap results
- [ ] Person pages loading with full filmography
- [ ] Director Rabbit Hole showing for qualified directors

---

## PHASE 5 — POLISH & SCALE
**Duration:** Weeks 37–44 | **Goal:** Performance. Digest. Streaming layer. App Store ready.

### 5.1 Weekly Digest (Weeks 37–38)
- [ ] Build digest computation job (GitHub Actions weekly cron — every Sunday 6am UTC):
  - For each active user, compute 4 digest items:
    1. "Film you should watch this week" — top Daily Pick
    2. "Because you loved [Film]" — one personalised film
    3. "This week's hidden gem" — one discovery pick
    4. "Your [genre] blind spot" — one blind spot film
  - Store in `weekly_digests` table
- [ ] In-app digest card: shown on Home on Monday morning
- [ ] Email digest via Resend (free tier: 3,000 emails/month):
  - HTML template (plain-text-inspired design for deliverability)
  - One-click unsubscribe link (required by law)
  - Send only to users who opted in during onboarding
  - Test email with real data before enabling for all users
- [ ] Adaptive send time: send based on user's most active hour (from `recommendation_events` timestamps)

### 5.2 Streaming Layer Enhancement (Weeks 39–40)
**Free tier: TMDb Watch Providers only (no Watchmode)**
- [ ] Enhance streaming data sync:
  - Currently syncing during TMDb film sync — ensure Watch Providers called for each film
  - Add `verified_at` update on each sync run
  - Films older than 24h since verification shown with "last verified [time]" note
- [ ] Build "Notify Me" tracker:
  - `availability_watches` table: user + film + requested date
  - Nightly job: for each watch, re-check TMDb for availability
  - If availability found: send FCM push + email (if opted in)
- [ ] Streaming filter on Mood Pick and Matcher fully tested with real streaming data

### 5.3 Performance & Optimisation (Weeks 41–42)
- [ ] Audit and add missing database indexes
- [ ] Implement response pagination everywhere (cursor-based, not offset — avoids count queries)
- [ ] Optimise film detail page: load critical data first (hero + status), lazy-load credits + streaming
- [ ] Add API response time logging: alert (via Sentry) if any endpoint exceeds 2 seconds
- [ ] Implement list virtualisation everywhere: `FlashList` for all scrollable film grids
- [ ] Reduce image sizes: use `w342` TMDb poster for cards, `w500` for detail, `w1280` for backdrops
- [ ] Prefetch next Daily Pick: load pick for tomorrow in the background after user sees today's
- [ ] Profile screen: lazy load stats tab (heavy query — no need to block initial render)

### 5.4 App Store Preparation (Weeks 43–44)
- [ ] Create Expo EAS Build configuration: `eas.json` for production build
- [ ] Add Apple Sign In (now required before App Store submission):
  - Enroll in Apple Developer Program ($99/yr)
  - Configure Sign In with Apple in Xcode
  - Add Apple OAuth provider to Supabase
- [ ] App Store assets:
  - [ ] App icon: 1024×1024 PNG (no alpha)
  - [ ] Screenshots: 6.7", 6.5", 5.5" iPhone + iPad (if supported)
  - [ ] Preview video (optional but recommended)
  - [ ] App description, keywords, support URL, privacy policy URL
- [ ] Google Play assets:
  - [ ] Feature graphic: 1024×500 PNG
  - [ ] Screenshots: phone + 7" tablet + 10" tablet
  - [ ] App description, full description, category
- [ ] Privacy policy: host on Vercel web app at `/privacy`
- [ ] Terms of service: host at `/terms`
- [ ] TestFlight beta: distribute to 20–50 external testers
- [ ] Google Play Internal Testing: distribute to 10–20 testers
- [ ] Fix all beta feedback before Phase 6

### Phase 5 Done Checklist
- [ ] Weekly Digest computing and displaying in-app correctly
- [ ] Digest email sending via Resend, one-click unsubscribe working
- [ ] Streaming data verified <24h old for all films in user activity
- [ ] Notify Me tracking and firing push on availability change
- [ ] All major screens load in <2 seconds on a mid-range Android device
- [ ] Crash-free session rate >99% (Sentry)
- [ ] TestFlight and Play Internal Testing builds submitted and live
- [ ] App Store listing complete and reviewed by team

---

## PHASE 6 — PUBLIC LAUNCH
**Duration:** Weeks 45–52 | **Goal:** Ship it. Watch it. Iterate.

### 6.1 Final Pre-Launch (Weeks 45–46)
- [ ] Fix all issues raised in beta feedback
- [ ] Final manual test pass: every feature, every screen, both platforms
- [ ] Review App Store guidelines (Apple Human Interface Guidelines, Google Play Policies)
- [ ] Confirm all free tier limits are safe at expected launch traffic:
  - Supabase: 500 MB storage — ensure film data fits (films table ~50 MB for 10K films)
  - Upstash: 10K commands/day — monitor usage week before launch
  - Gemini: 1M tokens/month — should last for first 500–1,000 users
  - Resend: 3K emails/month — add opt-in friction to manage volume
  - Render: Free doesn't scale. **Upgrade to Render Starter ($7/mo) before launch**
  - Supabase: free tier supports 50K monthly active users — more than enough for launch
- [ ] Set up status page: use Freshping (free) for uptime monitoring + public status page

### 6.2 App Store Submission (Weeks 47–48)
- [ ] iOS App Store:
  - Submit via App Store Connect
  - Select appropriate content rating (12+)
  - Answer App Store review questions honestly
  - Expected review time: 1–3 days
- [ ] Google Play:
  - Promote from Internal Testing → Closed Testing → Open Testing → Production (staged 20%)
  - Complete Data Safety form (document what data you collect)
  - Expected review time: 1–7 days
- [ ] Set up launch monitoring:
  - PostHog dashboard: DAU, new registrations, Daily Pick open rate
  - Sentry: error rate alert if >1% crash rate
  - Render dashboard: memory/CPU usage

### 6.3 Soft Launch & Monitoring (Weeks 49–52)
- [ ] Soft launch to first 500 users (invite-only or limited geography)
- [ ] Monitor daily:
  - D1, D7 retention (PostHog)
  - Daily Pick dismissal rate (target <15%)
  - Onboarding completion rate (target >70%)
  - Crash-free rate (target >99.5%)
- [ ] Fix issues within 24 hours (hotfix → Render deploy in <5 min)
- [ ] Collect NPS feedback: use Typeform (free tier, embed in-app via WebView)
- [ ] Review Gemini token usage — if approaching limit, implement stricter caching
- [ ] Monitor Supabase storage growth — if approaching 400 MB, optimise film data
- [ ] Public launch announcement when all metrics above threshold

### Phase 6 Done Checklist
- [ ] App live on both App Store and Google Play
- [ ] D1 retention >40%
- [ ] Daily Pick open rate >60%
- [ ] Crash-free rate >99.5%
- [ ] Zero P0 bugs (data loss, auth failures, privacy leaks)
- [ ] Render upgraded from free to Starter tier
- [ ] All free tier limits monitored with alerts

---

## FREE TIER LIMIT MONITORING

Set up these alerts **before** going live so you're never surprised:

| Service | Alert Trigger | Action |
|---------|--------------|--------|
| Supabase Storage | >400 MB (80% of free 500 MB) | Purge old poster URLs, switch to TMDb direct links |
| Supabase DB connections | >40 concurrent | Enable Supabase connection pooler (PgBouncer — free) |
| Upstash Redis | >8,000 commands/day | Increase Redis TTLs, reduce cache granularity |
| Gemini API | >12 RPM average | Increase cache TTL, deduplicate requests aggressively |
| Resend | >2,500 emails/month | Add opt-in confirmation screen before digest signup |
| Sentry | >4,000 errors/month | Fix root causes, increase session sampling rate |
| GitHub Actions | >1,500 min/month | Optimise CI (cache pnpm installs, skip unchanged workspaces) |
| Render | Memory >450 MB | Upgrade to Starter ($7/mo) before it becomes an issue |

---

## UPGRADE PATH (When You Outgrow Free Tier)

| Milestone | What to Upgrade | Cost |
|-----------|----------------|------|
| 100 daily users | Render Starter | $7/mo |
| 1,000 daily users | Supabase Pro | $25/mo |
| 5,000 daily users | Upstash Pay-as-you-go | ~$10/mo |
| 10,000+ daily users | Full GCP migration (Cloud Run + Cloud SQL) | Variable |

---

*This document is the single source of developer truth for building Flick phase by phase.*
*Cross-reference PRD.md for feature specifications, acceptance criteria, and algorithm details.*
*Every task in this file maps to a feature in the PRD Feature Directory (Section 7).*
