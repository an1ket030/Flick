# Flick Phase Tracker

> Last updated: 2026-04-11
> Phase 0: COMPLETE ✓
> Phase 1: IN PROGRESS (~30% complete)

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

## Phase 1 — Core Product 🔄 IN PROGRESS

**Duration:** Weeks 5–12 | **Target:** A real app a real user can use.

### 1.1 Authentication ⚠️ ~60% Complete

- [x] Welcome screen (`app/(auth)/welcome.tsx`)
- [x] Login screen with email/password (`app/(auth)/login.tsx`)
- [x] Signup screen with @ username (`app/(auth)/signup.tsx`)
- [x] Supabase auth wired: `signUp()`, `signInWithPassword()`, `signOut()`
- [x] Token refresh via `onAuthStateChange()` (Supabase auto-handles)
- [x] Logout implemented in Profile screen
- [ ] **Google OAuth** — screen + `signInWithOAuth({ provider: 'google' })` NOT implemented
- [ ] **Forgot Password screen** (`app/(auth)/forgot-password.tsx`) — NOT built
- [ ] **Auth → Onboarding redirect** — `_layout.tsx` does NOT redirect to onboarding when taste profile is missing
- [ ] End-to-end test: register → verify email → login → logout → refresh

### 1.2 Onboarding Flow ❌ 0% Complete

- [ ] `app/onboarding/` directory with 5 screen files — NOT created
- [ ] `OnboardingProgress.tsx` component (5-segment bar) — NOT built
- [ ] Screen 1: Format Preferences (2×2 grid: Live Action / Animation / Anime / All)
- [ ] Screen 2: Region Comfort (10 region tiles, all selected by default)
- [ ] Screen 3: Pace & Tone sliders (`@miblanchard/react-native-slider`)
- [ ] Screen 4: Genre Loves & Hates (24 genres, 3-state cycle)
- [ ] Screen 5: Seed Film Ratings (8 films, 10-pt rating OR "Haven't seen it")
- [ ] Taste Profile Card (template-driven 2–3 sentence summary)
- [ ] "Skip to Flick" CTA
- [ ] `onboarding_phase = 1` set on completion → redirect to home

### 1.3 Film Search & Detail ⚠️ ~45% Complete

**Search:**
- [x] Search bar with 300ms debounce
- [x] Genre filter pills
- [x] Search results list with poster/year/language/rating
- [ ] **Autocomplete** (top 5 as user types) — NOT implemented
- [ ] **Recent searches** (AsyncStorage, last 20) — NOT implemented
- [ ] **Filter panel** (year, country, language) — only genre done
- [ ] **Empty state + "Not finding it?" feedback** — NOT implemented
- [ ] **Backend search API** (`GET /api/films/search`) — NOT built (using direct Supabase)
- [ ] **Redis cache** for search results — NOT implemented

**Film Detail:**
- [x] Hero: backdrop, title, year, runtime, TMDb rating
- [x] Synopsis (collapsed 3 lines + "Read more")
- [x] Cast: top 6 with avatar placeholders
- [x] Similar films horizontal scroll
- [x] Library status bottom sheet (5 options)
- [ ] **Streaming availability** (from `streaming_availability` table) — NOT shown
- [ ] **10-point rating picker** (only when status = Watched) — NOT implemented
- [ ] **Crew**: director/writer/DP separately — partial (director only)
- [ ] **Keywords chips** — NOT shown
- [ ] **Convince Me card** (template v1: Hook + Twist + Personal Reason) — NOT implemented
- [ ] Country flags in hero

### 1.4 Library ⚠️ ~20% Complete

- [x] Status filter tabs (All / Planned / Watching / Watched / Paused / Dropped)
- [x] Film entry rows with status color strips
- [x] Basic stats bar (total / watched / planned / avg rating)
- [ ] **Grid view** (poster wall, FlashList) — NOT built
- [ ] **List view** (title + year + director + rating rows) — partial (no director)
- [ ] **Stats view** (full visual dashboard) — NOT built
- [ ] **Sort menu** (8 options: date added, date watched, rating, title, year) — NOT implemented
- [ ] **In-library search bar** — NOT implemented
- [ ] **Full stats computation**: top genre, top director, top country, histogram, decade — NOT built
- [ ] **Film entry detail sheet** (long-press → bottom sheet):
  - [ ] Rating input (10-pt)
  - [ ] Personal note (max 1000 chars)
  - [ ] Tags input (chip-style, max 10)
  - [ ] Watch date picker
  - [ ] "Hide from friends" toggle
  - [ ] Delete entry button
- [ ] **Letterboxd Import** (entire feature):
  - [ ] `app/settings/import.tsx` screen
  - [ ] `expo-document-picker` CSV file picker
  - [ ] `POST /api/library/import/letterboxd` endpoint
  - [ ] CSV parsing + TMDb title/year matching
  - [ ] Progress tracking via Supabase Realtime
  - [ ] Post-import review screen (flagged low-confidence matches)

### 1.5 Daily Pick v1 & Home Screen ⚠️ ~10% Complete

**Daily Pick Algorithm (backend — NOT built):**
- [ ] `services/api/src/services/recommendation.ts`
- [ ] Layer 1 scoring function (genre × 0.35 + tone × 0.25 + pace × 0.20 + region × 0.20)
- [ ] Nightly GitHub Actions cron job to compute picks for all users
- [ ] Redis cache: `daily_pick:{userId}:{date}`, TTL 24h
- [ ] `GET /api/recommendations/daily-pick` endpoint
- [ ] Confidence mode: <5 ratings → 3 picks, 5–20 → 1 (medium), >20 → 1 (high)
- [ ] `POST /api/recommendations/daily-pick/:filmId/dismiss` endpoint
- [ ] Dismiss with reason + serve next from cached top-10
- [ ] Max 3 dismissals per day enforcement

**Home Screen:**
- [x] Greeting with display name + time of day
- [x] Hero card showing a film (currently: random high-rated, NOT personalised)
- [ ] **True Daily Pick** (personalised, from algorithm above) — NOT implemented
- [ ] **"Continue watching" row** (Watching/Paused films) — NOT implemented
- [ ] **"Because you loved [Film]" row** (genre/tone similar) — NOT implemented
- [ ] **"New on your platforms" row** (streaming data) — NOT implemented
- [ ] **Convince Me card** on Daily Pick — NOT implemented

### Phase 1 Done Checklist (from development_phases.md)

- [ ] User can register, verify email, log in, log out — PARTIAL
- [ ] Onboarding 5 screens complete, data persisted — ❌
- [ ] Search returns results in <500ms — ✅ (via direct Supabase)
- [ ] Film detail page loads all sections correctly — PARTIAL
- [ ] Library CRUD (add, update status, rate, note, tag, hide, delete) — PARTIAL (add + status only)
- [ ] Letterboxd CSV import working — ❌
- [ ] Daily Pick shows on home for all onboarded users — ❌
- [ ] Dismissal with reason, replacement served instantly — ❌
- [ ] No film in library ever appears as Daily Pick — ❌
- [ ] Library stats computing correctly — PARTIAL
- [ ] App runs without crash on iOS 16+ and Android 12+ — UNTESTED
- [ ] All API routes returning correct responses — ❌ (no routes built)
- [ ] Sentry error tracking live — ❌

---

## Phase 1 — What Remains

### Priority 1 (Blocking everything else)
1. **Onboarding Flow** (5 screens) — required for taste profile data and Daily Pick
2. **Auth → Onboarding redirect** — root layout must check `onboarding_phase`
3. **Forgot Password screen**
4. **Google OAuth**

### Priority 2 (Core product completeness)
5. **Library entry detail sheet** (rate, note, tags, watch date, hide, delete)
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

## Phase 2 — Intelligence (Upcoming — not started)

- [ ] Onboarding Phase 2 screens (screens 6–9)
- [ ] Film vector system
- [ ] Mood Pick (8 moods, 3 filters, 3 results)
- [ ] AI Convince Me (Gemini API)
- [ ] Your Predictions (requires ≥15 ratings)
- [ ] Explore tab (full personalised sections)
- [ ] Push notifications (FCM)

---

## Phase 3+ — Future

- [ ] Rewatch Vault
- [ ] Blind Spot Finder
- [ ] Time Capsule
- [ ] Director's Commentary
- [ ] Friends + Movie Night Matcher
- [ ] Weekly Digest (in-app + email)
- [ ] App Store submission
