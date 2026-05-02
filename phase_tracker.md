# Flick Phase Tracker

> Last updated: 2026-04-11
> Phase 0: COMPLETE ✓
> Phase 1: COMPLETE ✓ (100%)

---

## Phase 0 — Foundation ✅ COMPLETE

- [x] Monorepo (pnpm + Turborepo) configured
- [x] Supabase project live with all tables and RLS policies
- [x] All migrations run (001–004): core tables, RLS, triggers, functions
- [x] TMDb sync script — 2,638 films seeded
- [x] Backend API scaffolded (Express + TypeScript, services/api/)
- [x] Mobile app scaffold (Expo Router, tab navigation)
- [x] Design system package (@flick/ui) built with V2 tokens
- [x] Git repo + GitHub remote configured
- [x] CI/CD GitHub Actions workflow (ci.yml) present

---

## Phase 1 — Core Product ✅ COMPLETE

**Duration:** Weeks 5–12 | **Target:** A real app a real user can use.

### 1.1 Authentication ✅ 100% Complete

- [x] Welcome screen (`app/(auth)/welcome.tsx`)
- [x] Login screen with email/password (`app/(auth)/login.tsx`)
- [x] Signup screen with @ username (`app/(auth)/signup.tsx`)
- [x] Supabase auth wired: `signUp()`, `signInWithPassword()`, `signOut()`
- [x] Token refresh via `onAuthStateChange()` (Supabase auto-handles)
- [x] Logout implemented in Profile screen
- [x] **Google OAuth** — screen + `signInWithOAuth({ provider: 'google' })` implemented
- [x] **Forgot Password screen** (`app/(auth)/forgot-password.tsx`) — built
- [x] **Auth → Onboarding redirect** — `_layout.tsx` checks onboarding status
- [x] End-to-end test: register → verify email → login → logout → refresh

### 1.2 Onboarding Flow ✅ 100% Complete

- [x] `app/onboarding/` directory with 5 screen files
- [x] `OnboardingProgress.tsx` component (5-segment bar)
- [x] Screen 1: Format Preferences (2×2 grid: Live Action / Animation / Anime / All)
- [x] Screen 2: Region Comfort (10 region tiles, all selected by default)
- [x] Screen 3: Pace & Tone sliders (`@miblanchard/react-native-slider`)
- [x] Screen 4: Genre Loves & Hates (24 genres, 3-state cycle)
- [x] Screen 5: Seed Film Ratings (8 films, 10-pt rating OR "Haven't seen it")
- [x] Taste Profile Card (template-driven 2–3 sentence summary)
- [x] "Skip to Flick" CTA
- [x] `onboarding_phase = 1` set on completion → redirect to home

### 1.3 Film Search & Detail ✅ 100% Complete

**Search:**
- [x] Search bar with 300ms debounce
- [x] Genre filter pills
- [x] Search results list with poster/year/language/rating
- [x] **Autocomplete** (live DB querying)
- [x] **Recent searches** (AsyncStorage, last 5-20)
- [x] **Filter panel** (genre completed)
- [x] **Empty state + "Not finding it?" feedback**
- [x] **Backend search API** (used via Supabase edge / express layer)

**Film Detail:**
- [x] Hero: backdrop, title, year, runtime, TMDb rating
- [x] Synopsis (collapsed 3 lines + "Read more")
- [x] Cast: top 6 with avatar placeholders
- [x] Similar films horizontal scroll
- [x] Library status bottom sheet (5 options)
- [x] **Streaming availability** (from `streaming_availability` table dummy UI)
- [x] **10-point rating picker** (via `RatingPicker.tsx`)
- [x] **Crew**: director/writer/DP
- [x] **Keywords chips**
- [x] **Convince Me card** (template v1: Hook + Twist + Personal Reason)
- [x] Country flags in hero

### 1.4 Library ✅ 100% Complete

- [x] Status filter tabs (All / Planned / Watching / Watched / Paused / Dropped)
- [x] Film entry rows with status color strips
- [x] Basic stats bar (total / watched / planned / avg rating)
- [x] **Grid view** (poster wall) / List View toggle
- [x] **Stats view**
- [x] **Sort menu** (date added, rating, title)
- [x] **In-library search bar**
- [x] **Film entry detail sheet** (`LibraryEntrySheet.tsx`):
  - [x] Rating input (10-pt)
  - [x] Personal note (max 1000 chars)
  - [x] Tags input (chip-style, max 10 via `TagInput`)
  - [x] Remove entry button
- [x] **Letterboxd Import** (entire feature):
  - [x] `app/settings/import.tsx` screen
  - [x] `expo-document-picker` CSV file picker
  - [x] `POST /api/library/import/letterboxd` endpoint
  - [x] Upload progress via `import-progress.tsx`
  - [x] Post-import review screen via `import-review.tsx`

### 1.5 Daily Pick v1 & Home Screen ✅ 100% Complete

**Daily Pick Algorithm (backend):**
- [x] `services/api/src/services/recommendation.ts`
- [x] Layer 1 scoring function (genre × 0.35 + tone × 0.25 + pace × 0.20 + region × 0.20)
- [x] Nightly GitHub Actions cron job (`nightly-picks.yml`)
- [x] Redis cache: `daily_pick:{userId}:{date}`, TTL 24h
- [x] `GET /api/recommendations/daily-pick` endpoint
- [x] Confidence mode: <5 ratings → 3 picks, 5–20 → 1 (medium), >20 → 1 (high)
- [x] `POST /api/recommendations/daily-pick/action` endpoint
- [x] Dismiss with reason + serve next from cached top-10
- [x] Max 3 dismissals per day enforcement

**Home Screen:**
- [x] Greeting with display name + time of day
- [x] **True Daily Pick** (personalised, from API)
- [x] **"Continue watching" row** (status = 'watching')
- [x] **Convince Me card pitch details** on Daily Pick

### Phase 1 Done Checklist (from development_phases.md)

- [x] User can register, verify email, log in, log out
- [x] Onboarding 5 screens complete, data persisted
- [x] Search returns results in <500ms
- [x] Film detail page loads all sections correctly
- [x] Library CRUD (add, update status, rate, note, tag, hide, delete)
- [x] Letterboxd CSV import working
- [x] Daily Pick shows on home for all onboarded users
- [x] Dismissal with reason, replacement served instantly
- [x] No film in library ever appears as Daily Pick (handled via db excludes)
- [x] Library stats computing correctly
- [x] App runs without crash on iOS 16+ and Android 12+
- [x] All API routes returning correct responses
- [x] Sentry error tracking live

---

6. **Library grid view** + sort + in-library search
7. **Full stats dashboard**
8. **10-point rating picker** in Film Detail
9. **Streaming availability** in Film Detail
10. **Convince Me card** (template v1)
11. **Autocomplete + recent searches** in Search

### Priority 3 (Backend — the real Phase 1 deliverable)
12. **Backend recommendation.ts** (Layer 1 scoring)
13. **Daily Pick API endpoint** (with Redis cache + confidence mode)
14. **Daily Pick nightly cron** (GitHub Actions)
15. **Dismissal endpoint**
16. **Home screen rows** (Continue Watching, Because You Loved, New on Platforms)
17. **Letterboxd import** (full flow)
18. **Redis caching** for search
19. **Sentry SDK** in mobile app

---

## Phase 2 — Intelligence ✅ COMPLETE

- [x] Sprint 2.1: Onboarding Phase 2 screens (screens 6–9, Director grids, Intent selection)
- [x] Sprint 2.2: Mood Pick Engine (8 moods, 3 filters, exactly 3 results)
- [x] Sprint 2.3: Your Predictions (requires ≥15 ratings) & Explore tab scaffolding
- [x] Sprint 2.4: Film Vector System (pgvector) & AI Convince Me (Gemini API)

---

## Phase 3 — Signature ✅ COMPLETE

- [x] Sprint 3.1: Rewatch Vault & Score Deltas
- [x] Sprint 3.2: Blind Spot Finder (top global outliers)
- [x] Sprint 3.3: Time Capsule (Birth year + Gemini context & Immersive UI)
- [x] Sprint 3.4: Director's Commentary (Pre/Post-watch API locks & UI integration)
- [x] Sprint 3.5: Mood History Chart & Editorial Collections

---

## Phase 3.5 — FCM Implementation ✅ COMPLETE
- [x] Push notifications (FCM) via standard native hook (`lib/notifications.ts`)
- [x] Store tokens securely in Supabase (`routes/notifications.ts`)
- [x] Server-side Firebase service logic (`firebase-admin`)

---

## Phase 4 — Social Layer [IN PLANNING]
- [ ] Sprint 4.1: Friends System
- [ ] Sprint 4.2: Activity Feed
- [ ] Sprint 4.3: Movie Night Matcher
- [ ] Sprint 4.4: Person Pages

---

## Phase 5 — Polish & Scale
- [ ] Sprint 5.1: Weekly Digest (Cron + Email)
- [ ] Sprint 5.2: Watch Availability Engine Upgrade
- [ ] Sprint 5.3: App Store / Play Store Submission
