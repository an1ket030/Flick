# FLICK — Product Requirements Document
### Version 1.0 | April 2026

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Vision & Strategic Goals](#2-vision--strategic-goals)
3. [Target Audience & User Personas](#3-target-audience--user-personas)
4. [Brand Identity](#4-brand-identity)
5. [Success Metrics & KPIs](#5-success-metrics--kpis)
6. [Agile Development Framework Overview](#6-agile-development-framework)
7. [Feature Directory](#7-feature-directory)
8. [Phase 0 — Foundation](#phase-0--foundation-weeks-14)
9. [Phase 1 — Core Product](#phase-1--core-product-weeks-512)
10. [Phase 2 — Intelligence](#phase-2--intelligence-weeks-1320)
11. [Phase 3 — Signature Features](#phase-3--signature-features-weeks-2128)
12. [Phase 4 — Social Layer](#phase-4--social-layer-weeks-2936)
13. [Phase 5 — Polish & Scale](#phase-5--polish--scale-weeks-3744)
14. [Phase 6 — Public Launch](#phase-6--public-launch-weeks-4552)
15. [API Architecture Summary](#api-architecture-summary)
16. [Security Requirements](#security-requirements)
17. [Accessibility Requirements](#accessibility-requirements)
18. [Testing Strategy](#testing-strategy)
19. [Recommendation Engine — Complete Specification](#section-7-recommendation-engine--complete-specification)
20. [Complete API Contract](#section-8-complete-api-contract)
21. [Risk Register](#section-9-risk-register)
22. [Data Privacy & Compliance](#section-10-data-privacy--compliance)
23. [Content Quality Standards](#section-11-content-quality-standards)
24. [Internationalisation](#section-12-internationalisation-i18n)

---

## 7. FEATURE DIRECTORY

A complete map of every feature in Flick, the screen or section it lives in, the phase it ships in, and the tab navigation location for the mobile app. Use this as the single reference for "where does X live?" across the entire product.

### 7.1 Navigation Structure

The mobile app has 5 bottom navigation tabs:

| Tab | Icon | Primary Purpose |
|-----|------|----------------|
| **Home** | House | Daily Pick, quick actions, personal shortcuts |
| **Explore** | Compass | Discovery rows, recommendations, collections, mood pick |
| **Search** | Magnifier | Film and people search, autocomplete |
| **Library** | Bookshelf | Personal film library, stats, Rewatch Vault |
| **Profile** | Person | Account, taste profile, friends, settings |

---

### 7.2 Complete Feature Directory

| # | Feature | Tab / Location | Screen / Section | Phase | Notes |
|---|---------|---------------|-----------------|-------|-------|
| 1 | **Daily Pick** | Home | Primary card, full-width | Phase 1 | Refreshes daily at midnight |
| 2 | **Convince Me Card** | Home / Explore | Attached to every recommendation | Phase 1 (template) → Phase 2 (AI) | Hook + Twist + Personal Reason |
| 3 | **Daily Pick — Dismissal** | Home | Bottom sheet on swipe/tap | Phase 1 | 3 dismissals max per day |
| 4 | **Daily Pick — Replacement** | Home | Instant swap (no load screen) | Phase 1 | From pre-computed top-10 cache |
| 5 | **Confidence Mode (trio)** | Home | 3-pick "Getting to know you" layout | Phase 1 | Auto-switches to single pick above threshold |
| 6 | **Continue Watching** | Home | Horizontal scroll row | Phase 1 | Only shown if user has Watching/Paused films |
| 7 | **Smart Planned List** | Home | Horizontal scroll row | Phase 1 | 3 films from Planned, sorted by today's taste |
| 8 | **Mood Pick** | Home (CTA) + Explore | Full-screen or bottom sheet | Phase 2 | 8 moods, 3 filters, returns exactly 3 films |
| 9 | **Because You Loved [Film]** | Explore | Recommendation row | Phase 1 | Content-similar to most recently rated film |
| 10 | **Hidden Gems** | Explore | Recommendation row | Phase 2 | Critically regarded, <50K TMDb votes |
| 11 | **New Releases** | Explore | Recommendation row | Phase 2 | Last 90 days, filtered through taste model |
| 12 | **What People Like You Watch** | Explore | Recommendation row | Phase 2 (inactive until L2 threshold) | Collaborative filtering result |
| 13 | **Your Predictions** | Explore → Predictions section | Full screen | Phase 2 | Requires ≥15 personal ratings |
| 14 | **Your Outliers** | Explore → Predictions section | Subsection | Phase 2 | Films rated ≥2pts from TMDb consensus |
| 15 | **Blind Spot Finder** | Explore → Blind Spots | Full screen, 12 results | Phase 3 | Requires ≥10 ratings |
| 16 | **Themed Collections** | Explore → Collections | Horizontal scroll of collection cards | Phase 3 | 6 editorial collections, rotating weekly |
| 17 | **Collection Detail** | Explore → Collections → Detail | Full screen film list | Phase 3 | Personalised sort (unwatched first) |
| 18 | **Film Search** | Search | Full-screen search results | Phase 1 | Full-text + fuzzy, debounced 300ms |
| 19 | **People Search** | Search | In search results | Phase 1 | Directors, actors, composers, etc. |
| 20 | **Autocomplete** | Search | Inline suggestions | Phase 1 | Top 5 by title prefix, <100ms |
| 21 | **Recent Searches** | Search | Below search bar when empty | Phase 1 | Last 20, stored locally |
| 22 | **Film Detail Page** | Search / anywhere | Full-screen modal | Phase 1 | Full spec in Phase 1 section |
| 23 | **Director's Commentary — Pre-Watch** | Film Detail | "Watch it better" section | Phase 3 | Always visible once film is in library |
| 24 | **Director's Commentary — Post-Watch** | Film Detail | Locked card → unlocks on Watched | Phase 3 | Server-side lock enforcement |
| 25 | **Streaming Availability** | Film Detail | Platform badge row | Phase 1 | Country-specific, verified ≤24h |
| 26 | **Notify Me (availability tracker)** | Film Detail | CTA when no streaming found | Phase 5 | Push notification on availability change |
| 27 | **Similar Films** | Film Detail | Horizontal scroll row | Phase 1 | Content-based, excludes seen films |
| 28 | **Person Page** | Film Detail → tap cast/crew | Full-screen person profile | Phase 4 | Director/Actor/Writer/DP/Composer |
| 29 | **Director Rabbit Hole / Deep Dive** | Person Page | Full editorial section | Phase 4 | Only for filmographies ≥10 films (quality gated) |
| 30 | **Film Library — Grid View** | Library | Poster wall | Phase 1 | Default view |
| 31 | **Film Library — List View** | Library | Compact row list | Phase 1 | Title + year + director + rating |
| 32 | **Film Library — Stats View** | Library | Visual statistics dashboard | Phase 1 | 15+ computed stats |
| 33 | **Add to Library** | Library / Film Detail / Search | Bottom sheet status picker | Phase 1 | 5 statuses |
| 34 | **Rate Film** | Library / Film Detail | Rating sheet (10pt, 0.5 steps) | Phase 1 | Triggers after "Watched" status |
| 35 | **Personal Note** | Library → entry detail | Text field (max 1000 chars) | Phase 1 | Private |
| 36 | **Custom Tags** | Library → entry detail | Free-form chips (max 10) | Phase 1 | Private by default |
| 37 | **Hide from Friends** | Library → entry detail | Toggle switch | Phase 1 | Overrides all visibility settings |
| 38 | **Rewatch Logging** | Library | Detected duplicate → new entry | Phase 1 | Auto-increments watch_number |
| 39 | **Library Filtering** | Library | Filter panel (slide in) | Phase 1 | Status, genre, decade, country, rating |
| 40 | **Library Sorting** | Library | Sort menu | Phase 1 | 8 sort options |
| 41 | **Library Search** | Library | In-library search bar | Phase 1 | Searches within user's own library |
| 42 | **Letterboxd Import** | Onboarding + Profile → Settings | Import screen | Phase 1 | CSV upload, async, progress bar |
| 43 | **Rewatch Vault** | Library → Vault tab | Film list with prompts | Phase 3 | Rating ≥8.5, last watch >12 months |
| 44 | **Rewatch Delta** | Library / Film Detail | Rating comparison card | Phase 3 | Shows on re-rating a Vault film |
| 45 | **Library Statistics** | Library → Stats tab | Full visual dashboard | Phase 1 | Total hours, top director, genre chart, etc. |
| 46 | **Taste Profile Card** | Profile → Taste Profile | Summary card (editable) | Phase 1 | Human-readable summary of taste model |
| 47 | **Onboarding — Phase 1** | Onboarding flow | 5 screens | Phase 1 | Format, Region, Pace/Tone, Genres, Seed ratings |
| 48 | **Onboarding — Phase 2** | Profile → Fine-tune | 3–4 additional screens | Phase 2 | Extended seeds, Director familiarity, Primary intent |
| 49 | **Skip to Flick** | Onboarding | CTA button post-Phase 1 | Phase 1 | Always available after Screen 5 |
| 50 | **Adventurousness Slider** | Profile → Settings | Settings screen | Phase 1 | Controls discovery radius of Daily Pick |
| 51 | **Time Capsule Pick** | Home (1st of month) + notification | Special full-screen card | Phase 3 | Monthly, based on birth year |
| 52 | **Time Capsule — Share Card** | Time Capsule screen | Native share sheet | Phase 3 | Designed for social sharing |
| 53 | **Friends — Find & Connect** | Profile → Friends | Friend search + requests | Phase 4 | Search by username |
| 54 | **Friends — Privacy Controls** | Profile → Friends → [Friend] | Per-friendship settings | Phase 4 | Granular per-friend visibility |
| 55 | **Friend Activity Feed** | Profile → Friends → Activity | Chronological feed | Phase 4 | Emoji reactions only, no comments |
| 56 | **Movie Night Matcher** | Home CTA + Profile → Friends | Full-screen matcher flow | Phase 4 | 2–6 people, optional mood + filters |
| 57 | **Conflict Mode** | Matcher results | Toggle switch | Phase 4 | Anti-overlap algorithm |
| 58 | **Mood History** | Profile → Mood History | Private timeline | Phase 3 | Never shared, personal only |
| 59 | **Weekly Digest — In-App** | Notification + Home card | 4-item digest card | Phase 5 | Adaptive send time |
| 60 | **Weekly Digest — Email** | Email (opt-in) | Branded email template | Phase 5 | 4 items, plain-text-inspired |
| 61 | **User Collections (Create/Edit)** | Profile → My Collections | Collection editor | Phase 3 | Public or private |
| 62 | **User Collections (Public Profile)** | Profile → public view | Collections tab | Phase 4 | Followable by other users |
| 63 | **Account Settings** | Profile → Settings | Settings screens | Phase 1 | Notifications, theme, privacy, account |
| 64 | **Data Export** | Profile → Settings → Account | Export request flow | Phase 1 | ZIP delivered to email within 24h |
| 65 | **Account Deletion** | Profile → Settings → Account | Deletion flow with 30-day grace | Phase 1 | GDPR compliant |
| 66 | **Push Notifications** | System | Various triggers | Phase 2 onwards | Time Capsule, unlock, digest, availability |
| 67 | **Streaming Availability Notify Me** | Film Detail | CTA → tracker record | Phase 5 | Fires only on verified availability change |

---

## 1. EXECUTIVE SUMMARY

Flick is a film discovery and tracking platform that combines deep personal taste modelling, rich social discovery, intelligent multi-dimensional recommendations, and real-time streaming availability into one coherent, beautifully designed experience.

**Core Problem:** No single existing platform solves all parts of the film discovery equation. Letterboxd excels at logging but has a weak recommendation engine. JustWatch knows streaming availability but nothing about the user. Netflix recommends only its own catalogue. IMDb provides data without genuine personalisation. Regional cinema (Bollywood, Korean, anime, Nollywood) is perpetually underserved.

**Core Solution:** Flick is a film companion that feels less like a database and more like a friend with genuinely great taste in films who knows you well. It serves every cinema tradition equally, learns from every user interaction, and grows smarter over time.

**Platform:** iOS and Android mobile application (React Native), with a companion web app.

**Launch Target:** MVP in 6 months, public beta in 9 months, v1.0 in 12 months.

---

## 2. VISION & STRATEGIC GOALS

### 2.1 Vision Statement
"To be the definitive personal film companion for anyone who takes cinema seriously — regardless of which cinema tradition they love."

### 2.2 Strategic Goals

| Goal | Description | Horizon |
|------|-------------|---------|
| Personalisation depth | Build the most accurate film taste model of any consumer app | 12 months |
| Format agnosticism | Serve Hollywood, Bollywood, anime, K-cinema equally | Launch |
| Discovery quality | Users should discover at least one film per week they love | 6 months |
| Social utility | Movie Night Matcher used by 40% MAU with friends | 12 months |
| Retention | 60-day retention above 35% | 9 months |

### 2.3 Non-Goals (What Flick Is Not)
- Flick is NOT a streaming platform. It surfaces where to stream, it does not host content.
- Flick is NOT a review aggregator. It has a personal rating system, not a critical consensus engine.
- Flick is NOT a social network. The social layer is minimal and deliberate.
- Flick does NOT privilege Hollywood. All cinema traditions are peers.

---

## 3. TARGET AUDIENCE & USER PERSONAS

### 3.1 Primary Persona — "The Enthusiast"
- **Age:** 22–35
- **Behaviour:** Watches 3–5 films per week, already uses Letterboxd, has strong opinions about cinema
- **Pain points:** Recommendation engines don't know them well enough; Letterboxd's Explore feature is weak; no single place for tracking + discovery + streaming availability
- **What they want:** A recommendation engine that surprises them, tracks rewatches, and doesn't feel like it was built by a studio algorithm
- **Adoption trigger:** Letterboxd import + strong first Daily Pick recommendation

### 3.2 Secondary Persona — "The Casual Watcher"
- **Age:** 18–45
- **Behaviour:** Watches 1–2 films per week, mostly on Netflix/Prime, doesn't currently track films
- **Pain points:** Spends 20 minutes deciding what to watch and gives up; doesn't know what's good outside their comfort zone
- **What they want:** Someone to just decide for them; learn about great films without effort
- **Adoption trigger:** Mood Pick feature + Daily Pick with a genuinely good first recommendation

### 3.3 Tertiary Persona — "The Regional Cinema Fan"
- **Age:** 16–50
- **Behaviour:** Primarily watches a specific regional tradition (Bollywood, anime, K-drama films, Nigerian cinema) and feels underserved by Western apps
- **Pain points:** Western apps treat their preferred cinema as "foreign" or "niche"; recommendation engines fail them entirely
- **What they want:** An app that treats their cinema as the default, not an exception
- **Adoption trigger:** Onboarding that speaks their language + recommendations that actually work for their taste

### 3.4 User Journey Map (Enthusiast)
1. Hears about Flick from a friend / social media
2. Downloads app, imports Letterboxd library (2 minutes)
3. Completes Phase 1 onboarding (under 2 minutes)
4. Sees first Daily Pick with Convince Me card — impressed by specificity
5. Logs a new watch, rates it, sees updated predictions
6. Invites a friend, uses Movie Night Matcher for Friday session
7. Opens Blind Spot Finder — discovers a gap in their Park Chan-wook viewing
8. Returns daily for Daily Pick; weekly for Digest
9. Becomes an advocate, invites more friends

---

## 4. BRAND IDENTITY

### 4.1 Name
**Primary:** Flick — immediate, warm, universally understood as informal word for film.
**Fallback:** Kino — if trademark clearance fails, carries cinematic prestige from German/Slavic/Nordic usage.

### 4.2 Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#1A1A2E` | Primary background (near-black navy) |
| `--color-accent-gold` | `#C9A84C` | Primary accent, CTAs, highlights |
| `--color-text-primary` | `#F0EFEB` | Body text, primary content |
| `--color-bg-surface` | `#16213E` | Card surfaces, elevated elements |
| `--color-bg-elevated` | `#0F3460` | Modal backgrounds, overlays |
| `--color-text-muted` | `#8B8FA8` | Placeholder text, secondary labels |
| `--color-success` | `#4CAF82` | Positive states, available streams |
| `--color-warning` | `#E8A838` | Caution states, leaving soon |
| `--color-error` | `#E85555` | Error states |

### 4.3 Typography

| Role | Typeface | Weight | Usage |
|------|----------|--------|-------|
| UI / Navigation | Inter | 400, 500, 600, 700 | All interface elements |
| Editorial / Hero | Playfair Display | 400, 700 | Convince Me cards, Collection titles, Film headers |
| Mono | JetBrains Mono | 400 | Rating numbers, statistics |

### 4.4 Logo
A minimal geometric mark abstracting a single film frame / shutter. The letter F is not forced into the mark. "Flick" set in brand typeface carries identity. Icon must be legible at 16×16px (home screen) and scale to billboard. Evokes motion without being literal.

### 4.5 Tone of Voice
- Intelligent but warm, never condescending
- Opinionated where it counts (recommendation copy), neutral where it should be (settings)
- Recommendation reasons have wit. Onboarding feels like a quiz, not a form.
- Error messages are human: "We couldn't load that. Try again?" not "Error 503."
- Never sounds machine-generated. Always sounds like a person who loves film.

---

## 5. SUCCESS METRICS & KPIs

### 5.1 Acquisition
| Metric | Target (Month 6) | Target (Month 12) |
|--------|-----------------|------------------|
| Total registered users | 10,000 | 100,000 |
| Daily active users (DAU) | 2,000 | 25,000 |
| Monthly active users (MAU) | 5,000 | 60,000 |
| Letterboxd imports at onboarding | 40% of new signups | 35% of new signups |

### 5.2 Engagement
| Metric | Target |
|--------|--------|
| Daily Pick open rate | >65% of DAU |
| Films rated per user per week | >3 |
| Mood Pick uses per MAU per month | >4 |
| Movie Night Matcher uses (of users with friends) | >40% monthly |
| Weekly Digest open rate (in-app) | >55% |

### 5.3 Retention
| Metric | Target |
|--------|--------|
| D7 retention | >55% |
| D30 retention | >40% |
| D60 retention | >35% |
| 6-month retention | >25% |

### 5.4 Quality
| Metric | Target |
|--------|--------|
| Rating of Daily Pick (user feedback) | >75% positive or neutral |
| Dismissal rate ("wrong mood" only) | <15% |
| App Store rating | >4.5 |
| Crash-free session rate | >99.5% |

---

## 6. AGILE DEVELOPMENT FRAMEWORK

Flick is developed using **Scrum with 2-week sprints** grouped into **quarterly releases (Phases)**. Each Phase has a defined scope, acceptance criteria, and a working, shippable product at its end.

### 6.1 Team Structure

| Role | Headcount |
|------|-----------|
| Product Manager | 1 |
| Engineering Lead | 1 |
| Backend Engineers | 2 |
| Mobile Engineers (React Native) | 2 |
| Frontend Engineer (Web) | 1 |
| UI/UX Designer | 1 |
| Data / ML Engineer | 1 |
| QA Engineer | 1 |
| DevOps / Infrastructure | 1 |

### 6.2 Phase Overview

| Phase | Duration | Theme | Deliverable |
|-------|----------|-------|-------------|
| Phase 0 | Weeks 1–4 | Foundation | Infrastructure, design system, DB schema |
| Phase 1 | Weeks 5–12 | Core Product | Onboarding, Library, Daily Pick v1, Search |
| Phase 2 | Weeks 13–20 | Intelligence | Recommendation engine v2, Mood Pick, Predictions |
| Phase 3 | Weeks 21–28 | Signature | Rewatch Vault, Blind Spot, Time Capsule, Director's Commentary |
| Phase 4 | Weeks 29–36 | Social | Friends, Movie Night Matcher, Conflict Mode |
| Phase 5 | Weeks 37–44 | Polish & Scale | Weekly Digest, Streaming Layer, Performance |
| Phase 6 | Weeks 45–52 | Public Launch | App Store submission, marketing, analytics |


---

## PHASE 0 — FOUNDATION (Weeks 1–4)

### Objective
Establish all technical infrastructure so that every subsequent phase can build without rework. No user-facing features ship in Phase 0. Everything built here is invisible plumbing that makes the rest possible.

### Sprint 0.1 (Week 1–2): Infrastructure & Architecture

**Backend (Free Tier Stack):**
- **Database:** Supabase (PostgreSQL) — free tier: 500 MB, 50K MAU, built-in Auth, Storage, and Realtime
- **Backend API:** Render (free tier) — Node.js/Express service, spins down after 15min (keep-alive via UptimeRobot)
- **Web App:** Vercel (free tier) — Next.js hosting, CDN, custom domain
- **Auth:** Supabase Auth — email/password + Google OAuth (Apple OAuth added before App Store submission)
- **Cache / Session:** Upstash Redis (free tier) — 10,000 commands/day, 256 MB
- **Film Search:** PostgreSQL `pg_trgm` extension — built into Supabase, no separate service needed
- **File Storage:** Supabase Storage (free tier) — 1 GB, 2 GB bandwidth/month
- **Push Notifications:** Firebase Cloud Messaging (FCM) — free forever, unlimited pushes
- **AI Generation:** Google Gemini 1.5 Flash API (free tier) — 15 RPM, 1M tokens/month
- **Email:** Resend (free tier) — 3,000 emails/month, 1 domain
- **Error Monitoring:** Sentry (free tier) — 5,000 errors/month
- **Analytics / A/B Tests:** PostHog (free cloud) — 1M events/month, feature flags
- **CI/CD:** GitHub Actions (free) — 2,000 minutes/month
- **Secrets:** GitHub Actions Secrets + Render environment variables
- **Uptime Monitoring:** UptimeRobot (free) — 50 monitors, keeps Render warm

**Database Schema (initial):**
```
users
  id, email, password_hash, oauth_provider, oauth_id
  display_name, avatar_url, bio
  birth_year, country_code
  created_at, last_active_at, is_verified, is_active

taste_profiles
  user_id (FK), format_prefs (jsonb), region_prefs (jsonb)
  pace_slider (float), tone_slider (float)
  genre_loves (int[]), genre_hates (int[])
  adventurousness (float default 0.5)
  primary_intent (enum: transported|think|feel|fun)
  updated_at

films
  id, tmdb_id, imdb_id, title, original_title
  release_year, runtime_minutes, language_code
  country_of_origin (varchar[])
  genres (int[]), tmdb_genres (jsonb)
  director_ids (int[]), cast_ids (int[])
  synopsis, tagline
  poster_url, backdrop_url
  tmdb_rating, tmdb_vote_count
  content_rating
  created_at, updated_at, metadata_quality_score (float)

persons
  id, tmdb_person_id, name, profile_url
  known_for_department, biography, birthday
  created_at, updated_at

film_persons (junction)
  film_id, person_id, role (enum: director|actor|writer|cinematographer|composer)
  character_name, billing_order

user_film_entries
  id, user_id, film_id
  status (enum: planned|watching|watched|paused|dropped)
  rating (float, 0.5 increments, 0–10)
  personal_note (text)
  date_watched (date)
  rewatch_number (int default 1)
  is_hidden_from_friends (bool default false)
  custom_tags (varchar[])
  created_at, updated_at

streaming_availability
  film_id, country_code, platform_id
  stream_type (enum: subscription|rent|buy|free)
  stream_url, verified_at, expires_at

platforms
  id, name, logo_url, base_url, country_code

recommendation_events
  id, user_id, film_id, recommendation_type
  algorithm_version, confidence_score
  shown_at, action_taken (enum: watched|dismissed|ignored|added_watchlist)
  dismiss_reason (enum: wrong_mood|already_seen|not_interested|null)

mood_picks
  id, user_id, mood_selected, filters_applied (jsonb)
  films_returned (int[]), film_chosen (int or null)
  session_at

daily_picks
  id, user_id, date (date), film_id
  confidence_score, convince_me_copy (text)
  algorithm_layers_used (varchar[])
  action_taken, dismissed_at

friends
  user_id_a, user_id_b (always stored with a < b for uniqueness)
  status (enum: pending|accepted|blocked)
  initiated_by, created_at, accepted_at
  visibility_a_to_b (jsonb), visibility_b_to_a (jsonb)

lists
  id, user_id, title, description, is_public
  cover_film_id, created_at, updated_at

list_films
  list_id, film_id, sort_order, added_at, note
```

**Acceptance Criteria — Sprint 0.1:**
- [ ] All environments provisioned and accessible
- [ ] CI/CD pipeline runs on every PR, blocks merge on test failure
- [ ] Database schema migrated and seeded with test data
- [ ] Monitoring dashboards operational
- [ ] No secrets committed to version control (pre-commit hooks enforced)

### Sprint 0.2 (Week 3–4): Design System & TMDb Integration

**Design System (Figma + Code):**
- Complete Figma component library with all tokens from Section 4
- React Native design system package (`@flick/ui`) with:
  - `<FilmPoster />` — poster image with skeleton loading state
  - `<RatingBadge />` — displays tmdb/flick/predicted rating
  - `<PlatformBadge />` — streaming platform logo + type
  - `<FilmCard />` — horizontal and vertical variants
  - `<ConvinceMe />` — editorial recommendation card
  - `<GenreChip />` — tappable genre label
  - `<Button />` — primary, secondary, ghost, danger variants
  - `<TextInput />` — with label, error, and helper states
  - `<BottomSheet />` — modal bottom sheet container
  - `<SkeletonLoader />` — content placeholders during loading
  - `<EmptyState />` — zero-data screens with brand personality
- Typography scale, spacing system, icon library (custom + Lucide)
- Dark mode only at launch (brand requirement). Light mode on roadmap.

**TMDb API Integration Layer:**
- Create `FilmDataService` abstraction that wraps TMDb API
- Implement TMDb endpoints:
  - `GET /movie/{id}` — film detail
  - `GET /movie/{id}/credits` — cast and crew
  - `GET /movie/{id}/watch/providers` — streaming availability
  - `GET /movie/{id}/recommendations` — TMDb's own recommendations (used as one signal)
  - `GET /search/movie` — text search
  - `GET /person/{id}` — person detail
  - `GET /person/{id}/movie_credits` — filmography
  - `GET /discover/movie` — filtered discovery
- Build background sync job that populates local film DB from TMDb (nightly for new releases, weekly for historical updates)
- Implement `metadata_quality_score` calculation: films with complete metadata (synopsis, director, runtime, rating >1000 votes, genres ≥2) score 1.0; missing fields deduct proportionally
- Implement poster image caching pipeline: download → optimise → store on CDN → reference via CDN URL
- Rate limiting and retry logic with exponential backoff for TMDb API

**Acceptance Criteria — Sprint 0.2:**
- [ ] Figma component library complete with all specified components
- [ ] React Native design system package builds and renders in Storybook
- [ ] TMDb integration can fetch and store film records (test: 10,000 films seeded locally)
- [ ] Streaming availability data populated for test set (US, UK, IN, AU markets)
- [ ] Quality score assigned to all seeded films

---

## PHASE 1 — CORE PRODUCT (Weeks 5–12)

### Objective
Ship a working app that users can actually use: create an account, complete onboarding, search for and log films, manage a watchlist, and receive a first Daily Pick. This is the foundation on which all intelligence layers rest.

### Sprint 1.1 (Weeks 5–6): Authentication & Account

**User Stories:**
- As a new user, I can register with email and password in under 60 seconds
- As a new user, I can register with Google OAuth or Apple Sign-In
- As a returning user, I can log in with my credentials
- As a user, I can reset my forgotten password via email
- As a user, I can log out from any device
- As a user, I remain logged in across app restarts (refresh token)

**Technical Requirements:**
- JWT-based authentication with 15-minute access tokens and 30-day refresh tokens
- Refresh token rotation: every use of a refresh token invalidates it and issues a new one
- OAuth2 PKCE flow for Google and Apple
- bcrypt with cost factor 12 for password hashing
- Rate limiting: max 5 failed login attempts per IP per 15 minutes, then 30-minute lockout
- Email verification required before onboarding can begin
- Account deletion: GDPR-compliant, 30-day grace period, then permanent deletion of all personal data

**API Endpoints:**
```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/verify-email?token=
POST /auth/oauth/google
POST /auth/oauth/apple
DELETE /users/me
```

**Acceptance Criteria:**
- [ ] Register, login, logout flows complete on iOS and Android
- [ ] Google and Apple OAuth working in TestFlight / Play internal testing
- [ ] Password reset email delivers within 2 minutes
- [ ] JWT refresh working correctly across sessions
- [ ] Brute force protection verified via automated test

### Sprint 1.2 (Weeks 7–8): Onboarding Phase 1

**Overview:** 5-screen onboarding flow. Takes under 2 minutes. At completion, user sees 'Skip to Flick' button and has a minimal taste profile that makes a first Daily Pick possible.

**Screen 1: Format Preferences**
- Title: "What worlds do you watch in?"
- UI: 2×2 tap-to-select visual grid
  - Live Action (still from a recognisable live action film)
  - Animation (still from a non-anime animated film)
  - Anime (distinctive anime art style still)
  - All of the Above (split-panel with all three)
- Behaviour: multi-select, at least one required
- Data written: `taste_profiles.format_prefs`

**Screen 2: Region Comfort**
- Title: "Which of these film worlds excites you?"
- Framing: invitation, not restriction
- UI: scrollable grid of tiles with representative film stills
  - Hollywood, Bollywood, East Asian Cinema, Korean Cinema, Japanese (non-anime), European Cinema, Latin American Cinema, Middle Eastern Cinema, African Cinema (Nollywood etc), Anime
- Behaviour: multi-select, all selected by default (user deselects)
- Sub-text: "Films from any world can be great. We'll focus on the ones you tell us."
- Data written: `taste_profiles.region_prefs`

**Screen 3: Pace & Tone Sliders**
- Title: "How do you like your films?"
- UI: two independent sliders
  - Slider 1: "Slow & contemplative" ← → "Fast & relentless"
  - Slider 2: "Light & fun" ← → "Dark & challenging"
- Default: both at centre
- Each slider has illustrative microcopy at both poles
- Data written: `taste_profiles.pace_slider`, `taste_profiles.tone_slider`

**Screen 4: Genre Loves & Hates**
- Title: "Tell us what you love. Tell us what you hate."
- UI: scrollable tappable genre grid. Each genre chip has two states:
  - One tap: Love (amber gold highlight + heart icon)
  - Two taps: Hate (muted red + X icon)
  - Three taps: Neutral (returns to default)
- Genres shown (24 total): Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Fantasy, History, Horror, Musical, Mystery, Romance, Sci-Fi, Thriller, War, Western, Anthology, Biographical, Disaster, Heist, Martial Arts, Sports, Supernatural
- At least one love required to proceed
- Data written: `taste_profiles.genre_loves`, `taste_profiles.genre_hates`

**Screen 5: Seed Film Ratings**
- Title: "Rate these — even gut reactions count"
- UI: vertically scrollable list of 8 film cards
  - Each card: poster (full-bleed), title, year, country, 10-point tap rating OR "Haven't seen it" button
  - The 8 films are selected by the algorithm from a pool of ~100 seed films weighted to:
    - Represent all four Phase 1 region buckets (Hollywood, Bollywood, East Asian, Anime)
    - Have high IMDb vote counts (high information signal per rating)
    - Cover different genres, decades, and tones
    - NOT be obvious picks (no The Dark Knight, no Shawshank — users likely already have opinions that are less revealing)
- Behaviour: rating or skip for each; must rate or skip at least 4 to proceed
- Data written: `user_film_entries` (status: watched, with rating)

**Post-Phase-1 Screen:**
- Taste Profile Card revealed: a 2-3 sentence, human-written summary of who this person is as a film watcher (template-driven, not free-form AI for v1)
- Two CTAs: "Skip to Flick" (primary) and "Keep going — fine-tune your taste" (secondary)

**Acceptance Criteria:**
- [ ] All 5 screens render correctly on iOS 16+ and Android 12+
- [ ] Skip to Flick works after screen 5 and lands on correct home state
- [ ] Taste profile written to DB after phase 1 completion
- [ ] Seed films selected dynamically based on region preferences
- [ ] Progress bar visible throughout, showing 5/10 complete

### Sprint 1.3 (Weeks 9–10): Film Library & Search

**Search:**
- Full-text search against local Elasticsearch index (synced from TMDb)
- Search by title, director name, actor name
- Results ranked by: exact match → starts with → contains → fuzzy match
- Search filters: year range, genre, country, language
- Recent searches stored locally (last 20)
- "Not finding it?" suggestion to request a film be added (queued for manual review)

**Film Detail Page:**
Sections in order:
1. Hero: backdrop image, title, year, country flag(s), runtime, content rating, TMDb score
2. Streaming availability: platform badges for user's country with subscription/rent/buy labels
3. User's current library status: status selector + rating input if watched
4. Convince Me section: Flick's editorial reason (Predicted: "You might enjoy this because..." — generic version for v1)
5. Synopsis (collapsed to 3 lines, expandable)
6. Cast & crew: top 6 cast, director(s), writer, cinematographer — each tappable to person page
7. Genres and themes
8. TMDb community rating + Flick community rating (if ≥50 Flick users have rated)
9. Your predicted rating (visible once ≥10 personal ratings exist)
10. Similar films (horizontal scroll, content-based for v1)

**Library Management:**
- Add film to library with status (from detail page or search result card)
- Update status from any library view
- Rate on 0.5 increments (1.0–10.0) using a custom rating input (not a star display — numeric score with half-step picker)
- Add personal note (plain text, max 1000 characters)
- Log watch date (defaults to today)
- Rewatch tracking: if film already in library as Watched, logging again creates a new entry, auto-increments rewatch_number
- Add/remove custom tags (free-form, max 10 per entry, 30 chars each)
- Toggle hidden from friends (hidden icon indicator on card in library view)
- Delete entry (with confirmation dialog)

**Library Views:**
- All Films, Planned, Watching, Watched, Paused, Dropped (tab filter)
- Sort: date added, date watched, rating (asc/desc), title, year
- Search within library
- Grid view (posters) and list view (title + metadata row)

**Letterboxd Import:**
- File picker accepting CSV export from Letterboxd
- CSV columns mapped: `Name → title`, `Year → release_year`, `Rating → rating (×2 to convert 5-point to 10-point)`, `Date → date_watched`, `Letterboxd URI` (used to fuzzy-match to TMDb ID)
- Matching logic: title + year → TMDb search → best confidence match stored with `import_confidence_score`
- Low-confidence matches flagged for user review in a post-import screen
- Import progress shown as a progress indicator (can take 30–120 seconds for large libraries)
- Duplicate handling: if film already in library, import skips it (does not overwrite)
- Error report: after import, show count of successful, flagged, and failed matches

**Acceptance Criteria:**
- [ ] Search returns results in <500ms for any query
- [ ] Film detail page loads in <2 seconds on 4G
- [ ] Library CRUD operations all working with immediate UI feedback
- [ ] Rewatch creates new entry correctly
- [ ] Letterboxd CSV import working for test files of 100, 500, 1000 films
- [ ] Hidden films not visible in any social-facing view

### Sprint 1.4 (Weeks 11–12): Daily Pick v1 & Home Screen

**Home Screen Layout:**
- Top: greeting ("Good evening, [name]. Here's your pick for today.")
- Primary: Daily Pick card (full-width, poster backdrop, film title, Convince Me summary)
- Below: "Because you loved [Film X]" horizontal scroll (content-based v1)
- Below: "New on your streaming platforms" horizontal scroll (filtered by user's platforms)
- Bottom navigation: Home, Search, Library, Profile
- Maximum 3 rows on home. Additional discovery in Explore tab (added Phase 2).

**Daily Pick v1 Algorithm:**
- Layer 1 only (content-based filtering) for Phase 1
- Input: user's genre loves/hates, region preferences, pace/tone sliders, seed film ratings
- Process:
  1. Pull all films rated 7.0+ on TMDb with ≥1000 votes
  2. Filter by: not in user's library (any status), not in user's disliked genres
  3. Score each remaining film against taste profile (genre match × 0.3 + region match × 0.2 + tone match × 0.25 + pace match × 0.25)
  4. Apply discovery radius (default adventurousness 0.5): exclude top 10% mainstream films (by TMDb vote count) to bias toward discovery
  5. Select top candidate not shown in last 30 days
- Confidence calculation: if user has <5 ratings, confidence is LOW (show 3 picks). If 5–20 ratings, MEDIUM (show top pick with lighter confidence copy). If >20 ratings, HIGH (show single pick with full conviction).
- Pick refreshes at midnight user local time
- Dismiss behaviour: user taps "Not for me" → bottom sheet with reason (wrong mood / already seen / not interested) → immediate replacement pick from next in ranked list → dismiss reason logged

**Convince Me Card v1:**
- Three sections in editorial voice:
  - Hook: one sentence about what the film fundamentally is (pulled from synopsis, template-formatted for v1)
  - Twist: one sentence on what makes it special (from TMDb keywords/tags, template-formatted for v1)
  - Personal reason: "We think you'd love this because you enjoy [genre] films with a [tone] tone." (template v1 — AI-generated in Phase 2)
- Note: v1 uses templates. Phase 2 upgrades to contextualised AI-generated copy.

**Acceptance Criteria:**
- [ ] Daily Pick visible on home screen for all users who complete onboarding
- [ ] Confidence-based display working (3 picks for <5 ratings, 1 pick for >20)
- [ ] Dismiss with reason working and logging correctly
- [ ] Replacement pick served immediately after dismissal (no loading screen)
- [ ] Pick does not repeat a film shown in last 30 days
- [ ] Films already in library never appear as Daily Pick

---

## PHASE 2 — INTELLIGENCE (Weeks 13–20)

### Objective
Upgrade the recommendation engine from content-based to hybrid. Add Mood Pick, Your Predictions, and personalised Explore tab. Upgrade Convince Me copy from templates to AI-generated. Begin collecting the data patterns needed for collaborative filtering.

### Sprint 2.1 (Weeks 13–14): Onboarding Phase 2 & Taste Profile

**Onboarding Phase 2 Screens (accessible from Profile → Fine-tune your taste or shown after Phase 1 skip users return):**

**Screen 6–7: Extended Seed Ratings**
- 6–8 more films, now chosen from niches revealed by Phase 1 preferences
- A horror fan who loves East Asian cinema gets different seeds than a comedy fan who prefers Hollywood
- Same UI as Screen 5

**Screen 8: Director Familiarity**
- Title: "How many of these names do you know?"
- UI: rapid-fire name grid (30 director names, mixed across traditions)
- One tap = "I know this person" (no second tap needed — binary signal)
- Takes ~30 seconds
- Data feeds: Rabbit Hole Explorer, Blind Spot Finder

**Screen 9: Primary Intent**
- Title: "What do you most want from a film?"
- UI: 4 full-width option cards (select one)
  - "To be completely transported" 
  - "To think for days afterwards"
  - "To feel something deeply"
  - "To just have a great time"
- This signal persists and shapes Convince Me card tone
- Data written: `taste_profiles.primary_intent`

**Taste Profile Card (updated):**
- After Phase 2 completion, regenerate the Taste Profile Card with richer copy
- Now includes mention of their primary intent and top signal directors/genres
- Editable from Profile at any time (editing updates taste_profile, re-triggers recommendation recalculation)

### Sprint 2.2 (Weeks 15–16): Mood Pick

**Feature Specification:**
- Entry point: Home screen secondary CTA "Quick pick by mood" and dedicated Explore tab section
- No navigation required — single bottom sheet or dedicated screen

**Mood Selection UI:**
- 8 mood tiles in a 2×4 grid, each with:
  - Distinct visual treatment (different background colour tint per mood)
  - Short evocative label (not emoji)
  - Tiny explanatory sub-label

| Mood Label | Sub-label |
|------------|-----------|
| Feel something deeply | Drama. Emotion. Films that stay. |
| Turn my brain off | Comfort picks. No thinking required. |
| Genuinely disturbed | Horror, dread, psychological damage. |
| Laugh until it hurts | Pure comedy that actually works. |
| Inspired to do something | Stories that make you want to act. |
| Half-watch while tired | Light. Easy. Background-friendly. |
| Taken somewhere different | Adventure, world-building, escape. |
| Haunt me for days | Slow-burn. Ambiguous. Lingering. |

**Optional Quick Filters (below mood grid):**
- Runtime: 90 min / 2 hours / No limit (pill selector)
- Language: Any / No subtitles (toggle)
- Platform: Any / Only what I can stream now (toggle, requires streaming data layer)
- Filters are remembered between sessions per user

**Algorithm:**
- Map each mood to weighted genre, tone, pace, and theme scores
- Score all films in DB against (mood weights × user taste profile)
- Apply filters
- Return exactly 3 films (top 3 by combined score)
- Films already in library excluded
- Logging: mood selected, 3 films returned, which (if any) film was added to library or marked watched → stored in `mood_picks`

**Acceptance Criteria:**
- [ ] Mood selection to 3 results in <2 seconds
- [ ] Exactly 3 results returned always (unless DB has fewer eligible films — fallback: expand filter radius)
- [ ] Filters remembered correctly between sessions
- [ ] Mood pick events logged for Mood History feature (Phase 3)
- [ ] Films already watched/in-library excluded

### Sprint 2.3 (Weeks 17–18): Your Predictions & Explore Tab

**Your Predictions:**
- Entry: dedicated section in Explore tab
- Requires ≥15 user ratings to show personalised predictions (below threshold: show onboarding prompt)
- Algorithm:
  1. For each film NOT in user's library, compute a predicted rating using weighted attributes
  2. Compare predicted rating to TMDb average for that film
  3. Rank by `predicted_rating - tmdb_rating` (films where user is predicted to rate higher than consensus)
  4. Top 20 shown in "Films we think you'd love more than most people"
  5. Separately: identify films in user's history rated ≥2.0 points above or below TMDb consensus → "Your Outliers"

**Predictions Display:**
- Each film card shows: poster, title, year, large predicted score ("Flick thinks you'd give this an 8.5"), and one-line reasoning
- Reasoning template: "Because you consistently rate [genre] films by [director lineage] higher than consensus."
- "Your Outliers" subsection: films user rated significantly off-consensus with brief call-out

**Explore Tab:**
- Tab added to bottom navigation alongside Home, Search, Library, Profile
- Sections:
  - Your Predictions (if ≥15 ratings)
  - Mood Pick entry point
  - Because you loved [Film X] (expanded full-screen version)
  - Hidden Gems in your genres (critically regarded, <50K TMDb votes)
  - New releases matched to your taste (last 90 days, filtered through taste model)
  - Themed Collections (6 collections shown, algorithmically seeded, see Phase 3 for full spec)

### Sprint 2.4 (Weeks 19–20): AI-Generated Convince Me & Recommendation Engine v2

**Convince Me Upgrade:**
- Replace v1 template copy with AI-generated copy using Gemini API
- Input to AI: film metadata (title, director, genres, synopsis, themes, TMDb keywords), user's taste profile summary, primary intent signal, specific rating history patterns (e.g., "user rates Yorgos Lanthimos films 9.0+")
- Output: three paragraphs (Hook / Twist / Personal Reason), each ≤50 words, in Flick editorial voice
- Tone instruction in system prompt aligned to user's `primary_intent`
- Caching: generated copy cached per (film_id × user_id) and regenerated only when taste profile changes significantly (schema: `convince_me_cache` table)
- Fallback: if AI call fails, fall back to template v1 copy

**Recommendation Engine v2:**
- Introduce Layer 2 (collaborative filtering) alongside Layer 1
- Prerequisite: ≥500 active users each with ≥20 ratings (check before enabling)
- Implementation: user-user collaborative filtering using cosine similarity on rating vectors
- Cluster users into taste cohorts using k-means (k=20 initially, scale with user base)
- For a given user: find their cohort → surface films rated 8.0+ by cohort members not yet seen by target user
- Blend Layer 1 and Layer 2 with configurable weights (start 70/30, adjust based on A/B test results)
- Algorithm versioning: every change to the algorithm increments `algorithm_version` in `recommendation_events`

**A/B Testing Framework:**
- Implement feature flags system for experiment management
- First experiment: Template Convince Me vs AI Convince Me (measure: daily pick action rate)
- Experiment assignment is per-user, consistent across sessions, logged in `user_experiments` table

**Acceptance Criteria:**
- [ ] AI Convince Me generates copy for 90% of picks with no visible latency increase (<100ms for cached)
- [ ] Fallback to template copy verified (AI service kill switch tested)
- [ ] Collaborative filtering layer activates only above user threshold
- [ ] A/B test framework assigns users consistently and logs correctly
- [ ] Your Predictions visible for all users with ≥15 ratings
- [ ] Explore tab rendering all sections with correct data


---

## PHASE 3 — SIGNATURE FEATURES (Weeks 21–28)

### Objective
Ship the six signature features that differentiate Flick from every existing platform. These features elevate the product from "good recommendation app" to "genuinely unique film companion."

### Sprint 3.1 (Weeks 21–22): Rewatch Vault

**Feature Specification:**
- Entry: Library tab → "Rewatch Vault" section header, also surfaced on Home as occasional card
- Shows films where: `rating ≥ 8.5` AND `status = watched` AND `last_watch_date < 12 months ago` AND `rewatch_number ≥ 1` for prior Flick session only (not imported ratings from today)
- Sorted by: recency of original watch (oldest first — longest since you've seen it)
- Display: film card with original rating, watchdate, gentle prompt copy

**Vault Prompt Copy Examples** (must feel human-written):
- "You gave this a 9.5 three years ago. Have you changed?"
- "You haven't gone back to this in over a year. Still holds up?"
- "You called this one of your favourites. That still true?"
- Prompt copy generated from template with film-specific variables

**Rewatch Re-rating Flow:**
- User taps Vault card → Film detail page
- After marking as Watched again (new `user_film_entries` row, `rewatch_number` incremented)
- If new rating differs from most recent prior rating:
  - Bottom sheet surfaces: "Last time: 8.0. Now: 9.5. Something changed."
  - If rating increased: "Some films get better with time. This one did for you."
  - If rating decreased: "Interesting. What's different now?"
  - User can optionally add a note about the change
- Delta tracked in `rewatch_deltas` auxiliary table: `(user_id, film_id, old_rating, new_rating, delta, watch_date)`
- Recommendation engine weights: a film with positive rewatch delta is treated as more strongly positive evidence than a single 9.5 rating

**Acceptance Criteria:**
- [ ] Vault correctly surfaces only films meeting all four criteria
- [ ] Films imported today never appear in Vault
- [ ] Re-rating creates new `user_film_entries` row (does not overwrite)
- [ ] Delta surface shown whenever new rating ≠ prior rating
- [ ] Rewatch delta stored and accessible to recommendation engine

### Sprint 3.2 (Weeks 23–24): Blind Spot Finder

**Feature Specification:**
- Entry: Explore tab → "Your Blind Spots" section
- Requires ≥10 user ratings to generate meaningful results
- Definition of a Blind Spot: a film that meets ALL of:
  - TMDb rating ≥ 7.5 with ≥ 50,000 TMDb votes (culturally significant)
  - Film is in a genre, director lineage, or thematic cluster the user demonstrably loves (≥2 high-rated films in that cluster)
  - Film is NOT in user's library in ANY status (unknown is the point — not on Planned list)

**Ranking Algorithm:**
- Score each candidate blind spot: `(cultural_significance_score × genre_alignment_score × user_profile_match_score)`
- `cultural_significance_score`: normalised TMDb vote count weighted by critical consensus (aggregated from TMDb rating × log(vote_count))
- `genre_alignment_score`: how well the film's genre/theme vector aligns with user's high-rated film cluster
- `user_profile_match_score`: predicted personal rating from Layer 1 model
- Display top 12 blind spots

**Display:**
- Each blind spot card: poster, title, year, director, "Flick's take on why this is your blind spot."
- Flick's take (template v1, AI-upgraded in Phase 5): e.g., "You've rated 6 Park Chan-wook films. You haven't seen Oldboy. We have questions."
- "Why haven't I seen this?" CTA → Film detail page
- "Add to watchlist" CTA directly on card (one tap)

**Edge Cases:**
- If user has <10 ratings: show empty state with explanation and prompt to rate more films
- If a blind spot is added to Planned list: it disappears from Blind Spot Finder (confirmed: they now know about it)
- If metadata_quality_score < 0.6 for a candidate: exclude from results (avoid surfacing poorly-tagged films)

**Acceptance Criteria:**
- [ ] Blind Spots update within 1 hour of user adding new ratings
- [ ] Films on Planned list are excluded correctly
- [ ] Quality score filter applied (no poorly-tagged films shown)
- [ ] "We have questions" copy style is distinct and has personality
- [ ] Works correctly for all three major persona types (enthusiast / casual / regional)

### Sprint 3.3 (Weeks 25–26): Time Capsule Pick & Director's Commentary Mode

**Time Capsule Pick:**
- Delivery: once per month, on the 1st. Surfaced as a special card on Home AND as a push notification.
- Default year: user's birth year (collected during registration or profile setup)
- User can change the year at any time (profile setting: "My Time Capsule year")
- Algorithm:
  1. Pull all films from target year with TMDb vote count ≥ 10,000
  2. Apply taste profile filter (genre, tone, region preferences)
  3. Weight toward films that are both critically regarded AND had cultural moment significance (TMDb rating × cultural resonance proxy: a multiplier based on awards data, if available in TMDb metadata)
  4. Select top match not already in user's library
- Framing copy (AI-generated using Gemini):
  - Input: selected film metadata + target year + cultural context of cinema in that year
  - Output: 150–200 word paragraph: what was happening in cinema in [year], what this film meant then, why it still holds up today
  - Must feel like a gift, not a synopsis
- Share card: dedicated visual design with film poster, year, "Flick found the best film from the year I was born" framing, Flick branding
- Push notification copy: "Your [year] Time Capsule is ready. We found something good."

**Director's Commentary Mode:**
- Entry: Film detail page → "Watch it better" section → "Director's Commentary" CTA
- Unlocks when user is marked as planning/about to watch (status: Planned or Watching)

**Pre-Watch Note:**
- 150–200 words max
- NEVER mentions plot events, twists, or endings
- Covers: director's visual language in this specific film, the context in which it was made, the central question the film is asking
- Generated via Gemini with system prompt: "You are writing a pre-watch framing note. The reader has NOT seen this film. Do not spoil any plot events. Focus on how to watch, not what happens."
- Cached per film_id in `commentary_cache` table. Not personalised (same pre-watch note for all users of a film).

**Post-Watch Note:**
- 300–400 words max
- Unlocks ONLY after user sets film status to Watched (unlock event triggers immediately)
- Engages fully with themes, meaning, historical significance, director's body of work context
- Contains: thematic analysis, what other films are in conversation with it, why it endures
- System prompt: "You are writing a post-watch analysis. The reader has finished the film. Engage fully. Do not hedge. Be specific and opinionated."
- Cached per film_id
- "Read now" notification sent when unlocked: "You watched [Film]. Your post-watch note just unlocked."
- Quality gate: if `metadata_quality_score < 0.7`, do not generate (show placeholder: "Not enough information about this film to generate a note yet")

**Acceptance Criteria:**
- [ ] Time Capsule delivered on 1st of each month
- [ ] Framing copy generated and reviewed for quality (manual QA sample of 20 per month)
- [ ] Share card renders correctly and share sheet opens native share
- [ ] Pre-watch note is spoiler-free (LLM system prompt enforced + content review process)
- [ ] Post-watch note unlocks ONLY after Watched status set
- [ ] Commentary unavailable below quality threshold (no broken/empty notes)

### Sprint 3.4 (Weeks 27–28): Mood History & Themed Collections

**Mood History:**
- A private-only feature. Viewable only by the user themselves.
- Entry: Profile → "My Mood History"
- Display: chronological timeline, grouped by month
- Each entry shows: date, mood label selected, film(s) returned, film watched (if any that session)
- Copy example: "On a Friday in March, you wanted to feel something deeply. You watched Grave of the Fireflies."
- Generated from `mood_picks` table data
- Algorithmic use (silent): if user selects same mood consistently at same time-of-week (≥3 occurrences), flag pattern → `user_behavioral_patterns` table → adjust home screen framing for that time slot (e.g., "Ready to turn your brain off?" on Sunday evenings for that user)
- Pattern is NEVER surfaced to user. No "We noticed you always..." copy. Behaviour changes silently.

**Themed Collections:**
- Entry: Explore tab → "Collections" section
- 6 collections shown, rotating weekly
- Each collection has:
  - Editorially written title (human-crafted, not algorithmically generated)
  - One-sentence brief
  - Algorithm-populated film list (10–20 films per collection)
  - Personalisation: films user has already seen are visually faded; unwatched films sorted to top
- Example collections (initial batch):
  - "Gateway Films for 15 Countries' Cinemas" — brief: "The perfect first film from each tradition"
  - "Films That Reward a Second Watch" — brief: "Better the second time. Trust us."
  - "Directors Who Only Made One Great Film" — brief: "One was enough."
  - "The 10 Best Films About Grief That Aren't Depressing" — brief: "Yes, they exist."
  - "For When You Need to Feel Something but Can't Name What" — brief: "These films know."
  - "The Most Underrated Film of Each Decade" — brief: "Decade by decade, what critics missed."
- User actions: Save collection (adds to Profile → My Collections), Share collection link

---

## PHASE 4 — SOCIAL LAYER (Weeks 29–36)

### Objective
Build the minimal but genuinely useful social layer. The Movie Night Matcher is the centrepiece. Every social feature must earn its place.

### Sprint 4.1 (Weeks 29–30): Friend Connections & Privacy

**Friend System:**
- Find friends: search by username or invite via share link (no contacts access unless user grants it)
- Send friend request → recipient accepts/declines
- No mutual-follow asymmetry — connections are always bidirectional (both must accept)
- Block: removes connection, prevents further requests, is invisible to the blocked user (they see normal empty state)

**Privacy Model (fundamental requirement — must pass security review):**
- Default state: nothing is visible to friends
- Each friend connection has two independent visibility objects (A→B and B→A):
  ```json
  {
    "share_full_library": false,
    "share_ratings": false,
    "share_public_lists": true,
    "share_mood_picks": false
  }
  ```
- Individual film-level hide: `is_hidden_from_friends = true` overrides all other settings for that film
- The app NEVER tells friend A that friend B has hidden something from them
- Profile → Privacy → [Friend Name] → granular controls per friendship

**API Endpoints:**
```
POST   /friends/request
POST   /friends/accept/{request_id}
DELETE /friends/{friend_id}
POST   /friends/block/{user_id}
GET    /friends
GET    /friends/requests/pending
PATCH  /friends/{friend_id}/privacy
GET    /users/search?q=
```

**Acceptance Criteria:**
- [ ] Friend requests flow end-to-end on iOS and Android
- [ ] Privacy defaults are all false (minimum share) — verified in unit tests
- [ ] Hidden films do not appear in any API endpoint response for non-owner users
- [ ] Block is invisible to blocked user
- [ ] Privacy controls persist correctly across app restarts

### Sprint 4.2 (Weeks 31–32): Movie Night Matcher

**Feature Specification:**
- Entry: Home screen CTA "Movie Night?" or Friends tab → "Start a Match"
- Step 1: Select friends (multi-select from friend list, up to 6 people total including self)
- Step 2: Optional: set a mood for the group (same 8 moods as Mood Pick)
- Step 3: Optional: quick filters (runtime, language, platform)
- Step 4: Algorithm runs → results revealed one at a time with dramatic reveal animation

**Matcher Algorithm:**
- For each user in the group: compute their top 500 films by personal match score (using taste model)
- Find intersection: films that appear in all users' top 500
- Score intersection films by: `min(individual_match_scores) × overlap_bonus`
  - `overlap_bonus`: multiplied by how much agreement there is in rankings (if all users have it at top 50, bonus is higher)
- Apply mood filter if selected
- Return top 5 films, ranked

**Results Display:**
- One film at a time reveal (swipe left/right to browse all 5)
- Each result card shows:
  - Poster, title, year
  - Per-person match badges: "Alex: 9/10 match | Sam: 8/10 match | You: 8.5/10 match"
  - One-sentence group reason: "This works for all three of you — it's [genre] with [tone] that all of you rate highly."
- "Watch this tonight" CTA → shows streaming availability for user's country

**Conflict Mode:**
- Toggle on results page: "Challenge us" switch
- De-prioritises comfortable overlap, instead looks for:
  - Films in each person's high-rated genre clusters that are NOT in their actual history
  - The film that represents the productive edge for ALL group members simultaneously
- Framing copy: "Neither of you would pick this alone. That's the point."
- Returns 3 films in Conflict Mode (fewer because the target is more specific)

**Acceptance Criteria:**
- [ ] Matcher works for 2–6 person groups
- [ ] Results returned in <5 seconds for any group size
- [ ] Privacy respected: matcher only uses data from users who have shared ratings with the requester
- [ ] Conflict Mode returns distinct results from standard mode (verified in automated tests)
- [ ] Per-person match scores accurate (validated against known test data)

### Sprint 4.3 (Weeks 33–34): Friend Activity Feed & Person Pages

**Friend Activity Feed:**
- Entry: Friends tab → "Recent Activity"
- Shows: chronological feed of friends' recent activity they've chosen to share
- Each feed item: friend avatar, name, film poster, status (watched / added to plans / rated X), relative time
- Reactions: exactly 6 emoji options (👏 🔥 😍 😂 😱 ❤️). One tap to react. Reaction is visible to the friend who logged the film.
- No comment threads. No text replies. Low-pressure social.
- Visibility: only shows activity from friends who have `share_ratings: true` or `share_full_library: true` in their privacy settings with the viewing user
- Hidden films never appear in feed

**Person Pages (Director / Actor / Writer / Cinematographer / Composer):**
- Entry: tap any person name on film detail page
- Page structure:
  - Header: name, profile photo, known for (department), bio (collapsed to 3 lines)
  - Filmography tabs: "All" / "As Director" / "As Cast" / "As Writer" / etc.
  - Two sort orders available simultaneously:
    - "Critical consensus" — sorted by TMDb rating descending
    - "Your match" — sorted by user's predicted personal match score descending (only if ≥10 user ratings)
  - Each film in filmography: poster, title, year, TMDb rating, predicted Flick rating (if applicable), user's library status badge
  - "Recommended entry point" badge on the single film identified as best for new viewers (weighted: not necessarily highest rated, but a strong film with broad palette accessibility)

**Director Deep-Dive (for filmographies with ≥10 films in DB + metadata_quality_score ≥ 0.7):**
- Full editorial experience unlocked:
  - "Where to start" entry point recommendation with brief editorial note
  - "Watch order" recommendation (chronological is not always best — editorial order provided)
  - "What makes this director unique" paragraph (Gemini-generated from filmography metadata)
  - Link to Collections that feature this director
- Graceful degradation: filmographies with <10 films show clean list without editorial layer. Better to show nothing than to show a half-populated broken experience.

**Acceptance Criteria:**
- [ ] Feed correctly filtered by privacy settings
- [ ] Hidden films never appear for any user
- [ ] Emoji reactions delivered to film owner within 5 seconds (WebSocket or push)
- [ ] Person pages render correctly for directors in all size categories (1 film to 100+ films)
- [ ] Graceful degradation verified for thin filmographies

### Sprint 4.4 (Weeks 35–36): Social QA & Integration Testing

Full social layer integration tests. Privacy audit. Performance testing with synthetic social graph (10,000 users, diverse friend counts). Security penetration testing of friend visibility endpoints.

**Security Test Cases (must all pass):**
- [ ] User A cannot access User B's hidden film via direct API call
- [ ] User A cannot see User B's ratings if privacy is not shared, even via matcher endpoint
- [ ] Blocked user cannot appear in search results for blocker
- [ ] No data of blocked user visible after block

---

## PHASE 5 — POLISH & SCALE (Weeks 37–44)

### Objective
Ship Weekly Digest, complete streaming availability layer, resolve all known performance issues, prepare the app for public-scale load.

### Sprint 5.1 (Weeks 37–38): Weekly Digest

**Digest Specification:**
- Delivery: once per week, adaptive send time (2 hours before user's typical app open window, calculated from last 28 days of session data)
- Channels: in-app notification (always) + email (opt-in, on by default with opt-out)
- Always exactly 4 items:

| Item | Source | Logic |
|------|--------|-------|
| 1. New release pick | Algorithm | Last 90 days, filtered through taste model, not in library |
| 2. Hidden gem pick | Algorithm | Critics ≥7.8, TMDb votes <50K, high personal match |
| 3. Friend's recent pick | Social | A film a friend logged and rated ≥8.0 this week |
| 4. Leaving soon | Streaming | Film leaving any of user's platforms in next 7 days, high match |

- Item 4 verification: streaming data re-verified within 24 hours of send. If unverifiable → replace with second algorithm pick. Never send unverified availability.
- Item 3 fallback: if no qualifying friend activity → replace with Blind Spot pick
- Digest email template: plain-text-inspired HTML (not heavy HTML newsletter format), on-brand dark background, each item as a film card with poster, title, and one-sentence reason

**Adaptive Send Time Algorithm:**
- Pull last 28 days of session start times for user
- Identify peak hour (most common hour of session starts)
- Schedule digest for peak_hour - 2 hours
- If no session data (new user): default to 7pm local time Friday
- Send time updated weekly as new session data accumulates

### Sprint 5.2 (Weeks 39–40): Streaming Availability Completeness

- Audit streaming data coverage by country for all films in DB
- Implement Watchmode API as supplementary source (higher regional granularity than TMDb)
- Reconciliation logic: when TMDb and Watchmode disagree on availability, use more recent verified_at timestamp
- "Notify Me" feature: for films with no streaming/rental option in user's country
  - User taps "Notify me when available"
  - Stored in `availability_watchlist` table
  - Background job checks availability daily for all watched films
  - Notification fires only when: API confirms availability AND 24-hour re-verification passes
  - Notification copy: "[Film] is now available to stream on [Platform] in your country." + direct link

### Sprint 5.3 (Weeks 41–42): Performance & Reliability

**Performance Targets:**
| Metric | Target |
|--------|--------|
| Home screen time-to-interactive | <2 seconds on 4G |
| Search results latency | <500ms |
| Film detail page load | <2 seconds |
| Daily Pick generation time | <3 seconds |
| Matcher result generation | <5 seconds for 6-person group |
| API error rate | <0.1% |
| App crash-free session rate | >99.5% |

**Performance Work:**
- Implement aggressive caching: Redis for recommendation results (TTL: 4 hours), CDN for all media assets
- Database indexing audit: verify all query-path columns are indexed
- Query optimisation: identify and fix N+1 query patterns in library and social endpoints
- Image loading: implement progressive loading (blur-up from low-res placeholder), lazy load off-screen items
- Background pre-fetching: pre-compute Daily Pick at midnight so it is instant on morning app open
- Offline mode: cache last-seen library state for offline viewing

### Sprint 5.4 (Weeks 43–44): Beta Testing & Feedback Integration

- Closed beta: 500 users across all three persona types
- Beta feedback channels: in-app feedback button, weekly survey (5 questions max)
- Bug triage: P0 (crash/data loss) fixed within 24 hours; P1 (feature broken) within 72 hours; P2 (UX issue) in next sprint
- Net Promoter Score survey to all beta users at end of week 2 and week 4
- Key beta validation questions:
  - "Did the Daily Pick feel relevant to your taste?" (targets >70% yes)
  - "Did you discover a film you loved that you wouldn't have found otherwise?" (targets >50% yes in week 2)
  - "Would you recommend Flick to a friend who loves films?" (targets NPS >40)

---

## PHASE 6 — PUBLIC LAUNCH (Weeks 45–52)

### Sprint 6.1 (Weeks 45–46): App Store Submission

**iOS Requirements:**
- TestFlight public beta link shared with press contacts
- App Store Connect: all metadata complete (screenshots, description, keywords, privacy policy URL, support URL)
- Privacy nutrition label: accurately reflects data collected (email, ratings, viewing history, device identifiers for crash reporting)
- Age rating: 12+ (mild thematic content in film recommendations)
- In-app purchase setup (if any premium tier decided — scope TBD)

**Android Requirements:**
- Internal testing → closed testing → open testing → production
- Play Store listing: complete with feature graphic, screenshots (phone + tablet), description localised for EN/HI/KO markets at launch
- Content rating questionnaire complete

**Web App:**
- Companion web app at flick.film (or equivalent domain)
- Parity features: full library management, film detail pages, recommendations
- Progressive Web App (PWA): installable, offline-capable for library view

### Sprint 6.2 (Weeks 47–48): Marketing & Growth

**Launch Channels:**
- Product Hunt launch (coordinated day, goal: >500 upvotes, top 5 of day)
- Press: pitch to The Verge, Wired, Film Comment, Little White Lies, Letterboxd community channels
- Social: dedicated Twitter/X, Instagram — content strategy: daily film recommendations, behind-the-scenes algorithm posts
- Referral system: "Invite a friend → both get Blind Spot Finder unlocked one month early" (if freemium tier exists)
- Letterboxd community outreach: genuine engagement in discussions, not spam

**Launch Week KPIs:**
- Day 1: 1,000 registered users
- Week 1: 5,000 registered users
- Week 2: 10,000 registered users
- D7 retention of launch cohort: ≥55%

### Sprint 6.3 (Weeks 49–50): Analytics & Monitoring

**Analytics Implementation (privacy-respecting):**
- Posthog (self-hosted or cloud) for product analytics
- Events tracked: screen views, feature interactions, recommendation actions, onboarding step completions, digest engagement
- NO film title data sent to analytics — only film_id (internal) to avoid PII linkage
- Funnel tracking: Onboarding → Library first entry → Daily Pick interaction → Friend invite → Matcher use
- Revenue tracking (if any paid tier): Stripe integration

**Operational Monitoring:**
- Alerting: PagerDuty for on-call rotation
- P0 alert thresholds: API error rate >1%, crash rate >0.5%, DB query >5s p95
- Weekly engineering metrics review: latency trends, error budget, feature flag states

### Sprint 6.4 (Weeks 51–52): Post-Launch Stabilisation

- Fix all P0 and P1 issues discovered in launch week
- Scale infrastructure based on actual load (auto-scaling groups tuned to real traffic patterns)
- Publish first public roadmap to users ("Here's what we're building next" — transparency builds trust)
- Begin planning Phase 7 (Festival Tracker, Flick Score, Film Journals)

---

## API ARCHITECTURE SUMMARY

### External APIs
| API | Purpose | Tier |
|-----|---------|------|
| TMDb API | Film metadata, cast/crew, streaming availability (Watch Providers) | Free to start, Pro if needed |
| Watchmode API | Supplementary streaming availability, higher regional granularity | Paid |
| Google Gemini API | Convince Me copy generation, Director's Commentary, Time Capsule framing | Pay per use |
| SendGrid / AWS SES | Transactional and digest emails | Pay per use |

### Internal API Design Principles
- RESTful JSON APIs for all client-server communication
- Versioning: `/v1/` prefix on all routes
- Authentication: Bearer token in Authorization header
- Pagination: cursor-based for feeds and library (not offset-based — avoids gaps/duplicates)
- Error responses: always JSON `{ "error": { "code": "string", "message": "string", "details": {} } }`
- Rate limiting: 1000 requests/hour per user, 100 requests/hour per unauthenticated IP
- All write operations idempotent where possible (safe to retry)
- OpenAPI spec maintained for all endpoints, used to generate mobile SDK types

---

## SECURITY REQUIREMENTS

| Requirement | Implementation |
|-------------|---------------|
| Transport security | TLS 1.3 minimum on all connections |
| Data at rest | AES-256 encryption for PII fields |
| Password storage | bcrypt, cost factor 12 |
| Token security | Short-lived JWT (15min) + rotating refresh tokens |
| SQL injection | Parameterised queries only, ORM with no raw SQL in features |
| GDPR compliance | Right to erasure, right to portability (data export), explicit consent records |
| Privacy by default | All sharing defaults to off |
| Vulnerability scanning | Weekly SAST via GitHub CodeQL, quarterly penetration test |
| Dependency management | Dependabot for automated dep updates, weekly review |

---

## ACCESSIBILITY REQUIREMENTS

- WCAG 2.1 AA compliance minimum
- All interactive elements: minimum touch target 44×44pt
- All images: descriptive alt text
- Screen reader support: VoiceOver (iOS) and TalkBack (Android) tested for all core flows
- Dynamic type: all text scales correctly up to 200% system font size
- No colour-only information: all status indicators use both colour AND icon/text
- Reduced motion: app respects system reduce-motion preference (disables non-essential animations)

---

## TESTING STRATEGY

### Unit Tests
- Coverage target: 80% for all business logic (recommendation algorithm, privacy rules, streaming availability logic)
- Framework: Jest (TypeScript/Node), pytest (Python ML components)

### Integration Tests
- All API endpoints have integration tests with realistic data fixtures
- Auth flows tested end-to-end (register, login, oauth, refresh, logout)
- Privacy rules: automated test suite covering all shared/hidden state combinations

### End-to-End Tests
- Framework: Detox (React Native)
- Core user journeys covered: onboarding, library add/rate, daily pick interact, mood pick, matcher
- Runs in CI on every PR targeting main branch

### Performance Tests
- k6 load tests run against staging before every phase release
- Baseline: simulate 1000 concurrent users for 10 minutes
- Pre-launch: simulate 10,000 concurrent users for 30 minutes
- Latency and error rate recorded against SLAs

### Manual QA Checklist (per sprint)
- New feature smoke test on physical devices (iPhone 14, Samsung Galaxy S22, budget Android)
- Regression test of all core flows
- Accessibility audit of new screens
- Dark mode rendering verification
- Edge case: user with 0 ratings, user with 1000 ratings, user with 0 friends


---

## SECTION 7: RECOMMENDATION ENGINE — COMPLETE SPECIFICATION

This section is the definitive reference for every engineer working on the ML/algorithm components. It expands on the three-layer architecture summarised in Part 1 and specifies every input, transformation, output, and failure mode in full detail.

---

### 7.1 Architecture Overview

The Flick recommendation engine is a hybrid of three layers that activate progressively as data accumulates. Each layer is implemented as an independent microservice in the `services/recommendation/` Python FastAPI service. The API service calls the recommendation service over internal gRPC.

```
Client App
     │
     ▼
API Service (Node.js)
     │
     ▼ gRPC
Recommendation Service (Python/FastAPI)
     ├── Layer1Engine  ── film_vectors (Postgres)
     ├── Layer2Engine  ── rating_matrix (Redis sparse matrix)
     └── Layer3Engine  ── latent_model (Cloud Storage, periodically retrained)
     │
     ▼
Response assembled: ranked film list + scores + reasons
```

The recommendation service is stateless. All state lives in the database or cache. This enables horizontal scaling with no shared state problems.

---

### 7.2 Film Feature Vectors (Layer 1 Foundation)

Every film in the database has a pre-computed feature vector stored in a `film_vectors` table. This vector is the foundation for all content-based matching.

```sql
CREATE TABLE film_vectors (
  film_id        UUID PRIMARY KEY REFERENCES films(id),
  genre_vector   FLOAT8[] NOT NULL,   -- 24 dimensions, one per genre
  country_vector FLOAT8[] NOT NULL,   -- 20 dimensions, major country buckets
  decade_vector  FLOAT8[] NOT NULL,   -- 11 dimensions (1920s through 2020s)
  tone_score     FLOAT8 NOT NULL,     -- -1.0 (dark) to 1.0 (light)
  pace_score     FLOAT8 NOT NULL,     -- -1.0 (slow) to 1.0 (fast)
  runtime_bucket INTEGER NOT NULL,    -- 1=<90min, 2=90-120min, 3=120-180min, 4=>180min
  format_type    TEXT NOT NULL,       -- 'live_action', 'animation', 'anime'
  keyword_vector FLOAT8[],            -- 100 dimensions, top-100 TMDb keyword embedding
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

**Genre vector construction:**
- 24 dimensions map to the 24 genres in the Flick genre taxonomy
- Value for each dimension: 1.0 if film is tagged with that genre, 0.0 if not
- Films can have multiple genres (multiple 1.0s)
- Normalised to unit vector before storage

**Tone and pace scores (important: these are inferred, not directly from TMDb):**
TMDb does not provide tone/pace signals. These are derived from a combination of:
1. Genre proxy: Horror, Thriller, War → darker tone. Comedy, Animation → lighter tone.
2. Keyword proxy: keywords like "slow burn", "melancholic", "nihilism" → darker. "Uplifting", "family-friendly" → lighter.
3. Runtime proxy: films > 150 minutes assumed slower pace on average.
4. Director proxy: known auteurs with identified stylistic signatures (Tarkovsky → very slow/dark, Bay → very fast/light) contribute to the film's score.

The inference is imperfect but substantially better than no signal. The imprecision is acknowledged in the model documentation and improved over time as Flick's own user ratings provide ground truth feedback.

**Keyword vector construction:**
- TMDb provides free-text keyword tags for each film
- A vocabulary of the 100 most useful keywords (for recommendation purposes) is maintained manually and reviewed monthly
- For each film: binary encoding of which of the top-100 keywords are present
- This 100-dimension vector captures thematic content (e.g., "revenge", "coming-of-age", "unreliable narrator") beyond genre labels

**Recomputation schedule:**
Film vectors are recomputed whenever:
- New TMDb metadata is synced (nightly for popular films)
- A keyword is added or removed from the top-100 vocabulary (less frequent, requires full recomputation of all vectors)

---

### 7.3 User Taste Vectors (Layer 1 Foundation)

Each user has a corresponding taste vector that mirrors the film vector dimensions. This vector is the target for scoring: the closer a film's vector is to the user's taste vector, the higher the content match score.

```sql
CREATE TABLE user_taste_vectors (
  user_id        UUID PRIMARY KEY REFERENCES users(id),
  genre_vector   FLOAT8[] NOT NULL,   -- 24 dimensions, weighted by ratings
  country_vector FLOAT8[] NOT NULL,   -- 20 dimensions
  decade_vector  FLOAT8[] NOT NULL,   -- 11 dimensions
  tone_target    FLOAT8 NOT NULL,     -- preferred tone
  pace_target    FLOAT8 NOT NULL,     -- preferred pace
  format_prefs   FLOAT8[] NOT NULL,   -- 3 dimensions (live_action, animation, anime)
  keyword_affinity FLOAT8[],          -- 100 dimensions, affinities from rated films
  confidence     FLOAT8 NOT NULL DEFAULT 0.0,
  ratings_count  INTEGER NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

**How the taste vector is built:**

*From onboarding (before any ratings):*
- `genre_vector`: OB-4 genre loves → +1.0 per loved genre; genre hates → -1.0 per hated genre; neutral → 0.0
- `country_vector`: OB-2 region selections → +0.8 per selected region; unselected → 0.0
- `tone_target` and `pace_target`: directly from OB-3 sliders (normalised -1.0 to 1.0)
- `format_prefs`: from OB-1 selections
- `confidence = 0.15` (onboarding only — low but non-zero)

*Each time a film is rated:*
The taste vector is updated incrementally using an Exponential Moving Average (EMA) to weight recent ratings more heavily:

```
For each dimension d in [genre, country, decade, tone, pace, keywords]:
  new_vector[d] = alpha × film_vector[d] × normalised_rating
                + (1 - alpha) × old_vector[d]

where:
  normalised_rating = (user_rating - 5.0) / 5.0  (maps 0.5–10 to -0.9–1.0)
  alpha = 0.15 (controls update speed — higher alpha = faster adaptation)
```

- A rating of 10.0 strongly pulls the taste vector toward that film's traits
- A rating of 1.0 strongly pulls it away (negative signal)
- A rating of 5.0 is neutral (zero update)
- Ratings in the 6–7 range are mildly positive; 7.5+ are meaningfully positive; 9+ are strongly positive

*Confidence score update:*
```
new_confidence = min(1.0, 0.15 + (ratings_count × 0.04))
```
Confidence reaches 0.5 at ~9 ratings, 0.75 at ~15 ratings, 1.0 at ~21 ratings.
Above 0.75 confidence: single Daily Pick shown.
Below 0.5: three-pick "Getting to know you" mode.

**Letterboxd import acceleration:** When a user imports 200+ Letterboxd ratings, the taste vector is computed as a batch weighted average of all imported film vectors × their normalised ratings. Confidence score is set to `min(0.85, 0.15 + imported_count × 0.003)`.

---

### 7.4 Layer 1: Content-Based Scoring

For a given user and candidate film, the Layer 1 score is computed as:

```python
def layer1_score(user_taste: TasteVector, film: FilmVector) -> float:
    """
    Returns a score in [0, 1] representing content match.
    Higher is better.
    """
    # Cosine similarity between genre vectors
    genre_sim = cosine_similarity(user_taste.genre_vector, film.genre_vector)
    
    # Cosine similarity for country preference
    country_sim = cosine_similarity(user_taste.country_vector, film.country_vector)
    
    # Decade alignment (gaussian kernel centered on user preference decade)
    decade_sim = decade_alignment(user_taste.decade_vector, film.decade_vector)
    
    # Tone match: gaussian penalty for distance from preferred tone
    tone_match = gaussian_match(user_taste.tone_target, film.tone_score, sigma=0.4)
    
    # Pace match: gaussian penalty for distance from preferred pace
    pace_match = gaussian_match(user_taste.pace_target, film.pace_score, sigma=0.4)
    
    # Format match: binary 1.0 if format allowed, 0.5 if format neutral, 0.0 if excluded
    format_match = format_compatibility(user_taste.format_prefs, film.format_type)
    
    # Keyword affinity (only active if keyword_affinity vector exists and has entries)
    keyword_sim = cosine_similarity(user_taste.keyword_affinity, film.keyword_vector) \
                  if film.keyword_vector else 0.5  # neutral if no keywords
    
    # Weighted combination
    score = (
        0.30 × genre_sim +
        0.20 × country_sim +
        0.15 × decade_sim +
        0.15 × tone_match +
        0.10 × pace_match +
        0.05 × format_match +
        0.05 × keyword_sim
    )
    
    return score
```

**Exclusion filters applied before Layer 1 scoring (hard exclusions, not soft penalties):**
1. Film already in user's library in any status → excluded
2. Film's format type is in user's excluded formats → excluded
3. Film's primary genre has weight < -0.7 in user's genre vector → excluded (unless adventurousness ≥ 0.9)
4. Film is marked `adult = TRUE` and user account is not verified adult → excluded
5. Film has `metadata_quality_score < 0.4` → excluded (too little data for reliable matching)
6. Film already appeared as Daily Pick in last 90 days → excluded (for Daily Pick specifically)

**Discovery radius adjustment (applied after Layer 1 scoring):**

The discovery radius controls how much the algorithm stretches beyond the user's comfort zone.

```python
def apply_discovery_radius(candidates: List[FilmScore], adventurousness: float) -> List[FilmScore]:
    """
    Applies the discovery radius adjustment.
    adventurousness=0.0: only very safe picks (top 10% match)
    adventurousness=0.5: default. Picks from top 40%, with slight bias against the most mainstream
    adventurousness=1.0: maximum range, includes films from top 80% match, strong hidden-gem bias
    """
    # Sort by Layer 1 score descending
    sorted_candidates = sorted(candidates, key=lambda x: x.score, reverse=True)
    
    # Define the "comfort zone" as the top (1 - adventurousness) × 50th percentile
    # At default (0.5): top 25% are "safe picks", randomly sample from top 50%
    safe_cutoff = int(len(sorted_candidates) × (1.0 - adventurousness) × 0.5)
    exploration_cutoff = int(len(sorted_candidates) × (adventurousness × 0.8))
    
    # Apply hidden gem boost: films with vote_count < 100,000 get a bonus
    for candidate in sorted_candidates:
        if candidate.film.vote_count < 50_000:
            candidate.score *= 1.25   # Strong hidden gem
        elif candidate.film.vote_count < 100_000:
            candidate.score *= 1.10   # Moderate hidden gem
        # Blockbusters (>1,000,000 votes) get subtle penalty at non-zero adventurousness
        elif candidate.film.vote_count > 1_000_000 and adventurousness > 0.3:
            candidate.score *= 0.90
    
    return sorted_candidates
```

---

### 7.5 Layer 2: Collaborative Filtering

**Activation threshold:** Layer 2 activates only when the platform has ≥ 1,000 active users with ≥ 20 ratings each. Below this threshold, Layer 1 is the sole engine. This threshold is checked nightly and the layer transitions automatically — no code change required.

**Algorithm:** User-user collaborative filtering with taste cluster segmentation.

**Step 1: Taste cluster assignment (weekly job)**
```python
# k-means clustering on user taste vectors
# k starts at 10 clusters, increases by 5 per additional 2,000 users up to k=50
from sklearn.cluster import KMeans

def update_taste_clusters(user_taste_vectors: List[TasteVector]):
    n_users = len(user_taste_vectors)
    k = min(50, max(10, (n_users // 400)))
    
    # Feature matrix: genre_vector + country_vector + [tone_target, pace_target]
    feature_matrix = build_feature_matrix(user_taste_vectors)
    
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(feature_matrix)
    
    # Store cluster assignment
    update_user_clusters(user_taste_vectors, cluster_labels)
```

Cluster assignments are stored in `taste_profiles.cluster_id`. Re-assigned weekly. A user's cluster can change as their taste evolves.

**Step 2: Within-cluster high ratings (daily job)**
For each cluster, compute the top-rated films by cluster members:
```sql
-- Get films rated ≥ 8.0 by ≥ 10% of cluster members
SELECT 
  ufe.film_id,
  COUNT(DISTINCT ufe.user_id) as rater_count,
  AVG(ufe.rating) as avg_rating
FROM user_film_entries ufe
JOIN taste_profiles tp ON tp.user_id = ufe.user_id
WHERE tp.cluster_id = :cluster_id
  AND ufe.rating >= 8.0
  AND ufe.status = 'watched'
GROUP BY ufe.film_id
HAVING COUNT(DISTINCT ufe.user_id) >= :min_raters  -- 10% of cluster size
ORDER BY avg_rating DESC, rater_count DESC;
```

This result is cached in Redis per cluster with a 6-hour TTL: `key: "cluster:{id}:top_films"`.

**Step 3: Layer 2 score computation**
For a given user and candidate film:
```python
def layer2_score(user: User, film_id: UUID) -> float:
    cluster_id = user.taste_profile.cluster_id
    if cluster_id is None:
        return 0.0  # Layer 2 not active for this user
    
    cluster_top_films = cache.get(f"cluster:{cluster_id}:top_films")
    
    if film_id not in cluster_top_films:
        return 0.0
    
    film_data = cluster_top_films[film_id]
    
    # Normalise: score based on avg_rating and what proportion of cluster rated it
    cluster_size = user.taste_profile.cluster_size
    coverage = film_data.rater_count / cluster_size
    normalised_rating = (film_data.avg_rating - 5.0) / 5.0
    
    return coverage × normalised_rating  # Range [0, 1]
```

**Step 4: Blending Layer 1 and Layer 2**
```python
def combined_score(layer1: float, layer2: float, confidence: float) -> float:
    # Layer 2 weight increases with user confidence (more data = more reliable collab signal)
    # At max confidence (1.0): 70% L1, 30% L2
    l2_weight = 0.30 × confidence
    l1_weight = 1.0 - l2_weight
    
    return (l1_weight × layer1) + (l2_weight × layer2)
```

---

### 7.6 Layer 3: Matrix Factorisation

**Activation threshold:** Layer 3 activates when the platform has ≥ 10,000 active users with meaningful rating histories. This layer is computationally expensive and only meaningful with substantial data.

**Algorithm:** Alternating Least Squares (ALS) matrix factorisation using the `implicit` Python library, which uses GPU-accelerated sparse matrix operations.

**Training schedule:** Weekly retraining on Cloud ML (GPU instance). Each training run:
1. Pulls all `user_film_entries` with `status='watched'` and `rating IS NOT NULL`
2. Constructs a sparse user-item confidence matrix: `confidence = 1 + alpha × rating`
3. Trains ALS model with 50 latent factors, 20 iterations, regularisation λ=0.01
4. Stores trained model in Cloud Storage: `gs://flick-ml/models/als/YYYY-MM-DD/model.pkl`
5. Runs offline evaluation against held-out test set (15% of entries)
6. Promotes model to production only if Precision@10 ≥ 0.15 (minimum quality gate)
7. Old model remains in production until new model is validated

**Layer 3 score:**
For a given user-film pair, the ALS model computes a predicted confidence score using the user's and film's latent factor vectors: `score = user_factors @ film_factors.T`. This is normalised to [0, 1] and blended with Layers 1 and 2.

```python
def final_score(l1: float, l2: float, l3: float, confidence: float) -> float:
    if l3 > 0.0:
        # Three-layer blend when L3 is active
        return 0.50 × l1 + 0.25 × l2 + 0.25 × l3
    elif l2 > 0.0:
        # Two-layer blend
        return (1.0 - 0.30 × confidence) × l1 + (0.30 × confidence) × l2
    else:
        # L1 only
        return l1
```

---

### 7.7 Predicted Rating Engine (Your Predictions Feature)

This engine powers the "Your Predictions" section and displays predicted personal scores on film detail pages once a user has ≥ 15 ratings.

Distinct from the recommendation score (which measures match), the predicted rating attempts to answer: "If this user watched this film, what would they rate it?"

**Method: Regression over content similarity**

```python
def predict_rating(user: User, film: Film) -> float:
    """
    Predict what rating this user would give this film.
    Range: 0.5 to 10.0
    """
    # Get user's watched and rated films
    rated_films = get_rated_films(user.id)  # [(film_vector, rating)]
    
    if len(rated_films) < 15:
        return None  # Not enough data
    
    # Find the k=10 most similar films the user has already rated
    similarities = [
        (cosine_similarity(film.vector, rated_film.vector), rated_film.rating)
        for rated_film in rated_films
    ]
    
    # Sort by similarity, take top 15
    top_similar = sorted(similarities, key=lambda x: x[0], reverse=True)[:15]
    
    # Weighted average of their ratings (weighted by similarity)
    total_weight = sum(sim for sim, _ in top_similar)
    
    if total_weight == 0:
        return film.average_vote  # Fallback to community average
    
    predicted = sum(sim × rating for sim, rating in top_similar) / total_weight
    
    # Clamp to valid range
    return max(0.5, min(10.0, predicted))
```

**Outlier detection (Your Outliers subsection):**
```python
def is_outlier(user_rating: float, tmdb_rating: float, threshold: float = 2.0) -> bool:
    # TMDb is on a 10-point scale, Flick ratings are on a 10-point scale
    return abs(user_rating - tmdb_rating) >= threshold

def get_outlier_direction(user_rating: float, tmdb_rating: float) -> str:
    if user_rating > tmdb_rating:
        return "underrated"   # User rates it higher than consensus
    else:
        return "overrated"    # User rates it lower than consensus
```

Films where `|user_rating - tmdb_rating| ≥ 2.0` are surfaced as outliers with copy: "You rated [Film] a [X] when most people give it [Y]. Here's what else might do the same thing to you."

---

### 7.8 Mood-to-Film Mapping

The Mood Pick feature maps each of the 8 moods to weighted genre, tone, pace, and keyword signals. These weights are combined with the user's taste vector to produce the three film picks.

| Mood | Dominant Genres | Tone Target | Pace Target | Key Keywords |
|------|----------------|-------------|-------------|-------------|
| Feel deeply | Drama, Romance | -0.6 (dark) | -0.3 (slow-ish) | loss, family, love, grief |
| Turn off brain | Comedy, Action, Adventure | +0.8 (light) | +0.5 (fast) | fun, escapism, feel-good |
| Genuinely disturbed | Horror, Thriller, Psychological | -0.9 (dark) | -0.1 | disturbing, violent, unsettling |
| Laugh until hurts | Comedy | +1.0 (very light) | +0.3 | funny, comedy, satire, absurd |
| Inspired & ready | Biography, Drama, Sport | +0.3 | +0.1 | inspirational, motivational, triumph |
| Half-watch tired | Comedy, Romance, Animation | +0.7 | +0.4 | light, easy watch, comforting |
| Taken somewhere | Adventure, Fantasy, Sci-Fi | +0.2 | +0.0 | world-building, travel, epic |
| Haunt me for days | Drama, Horror, Arthouse | -0.7 | -0.6 (slow) | haunting, ambiguous, philosophical |

**Mood score computation:**
```python
def mood_score(film: FilmVector, mood: MoodWeights, user_taste: TasteVector) -> float:
    # Mood-to-film match
    mood_genre_match = sum(
        mood.genre_weights.get(genre, 0.0) × film.genre_vector[i]
        for i, genre in enumerate(GENRE_TAXONOMY)
    )
    mood_tone_match = gaussian_match(mood.tone_target, film.tone_score, sigma=0.5)
    mood_pace_match = gaussian_match(mood.pace_target, film.pace_score, sigma=0.5)
    mood_keyword_match = cosine_similarity(mood.keyword_vector, film.keyword_vector or [])
    
    mood_component = (
        0.40 × mood_genre_match +
        0.25 × mood_tone_match +
        0.20 × mood_pace_match +
        0.15 × mood_keyword_match
    )
    
    # User taste alignment (ensures mood picks are still personally relevant)
    taste_component = layer1_score(user_taste, film)
    
    # Mood component dominates but taste still matters
    return 0.65 × mood_component + 0.35 × taste_component
```

The top 3 unique films by mood_score become the Mood Pick results.

---

### 7.9 Movie Night Matcher Algorithm

For a group of 2–6 users, the Matcher finds films that work for everyone.

```python
def movie_night_match(
    users: List[User],
    mood: Optional[str] = None,
    max_runtime: Optional[int] = None,
    language_pref: str = 'any',
    platform_filter: Optional[List[str]] = None
) -> List[FilmMatch]:
    
    # For each user, compute personalised top-500 films
    user_top_500s = []
    for user in users:
        candidates = get_candidate_films(user)
        scored = [(film, combined_score(user, film)) for film in candidates]
        top_500 = sorted(scored, key=lambda x: x[1], reverse=True)[:500]
        user_top_500s.append({film: score for film, score in top_500})
    
    # Find intersection: films in ALL users' top-500
    shared_film_ids = set(user_top_500s[0].keys())
    for top_500 in user_top_500s[1:]:
        shared_film_ids &= set(top_500.keys())
    
    # Apply hard filters
    shared_film_ids = apply_hard_filters(
        shared_film_ids, max_runtime, language_pref, platform_filter
    )
    
    # Apply mood filter if selected
    if mood:
        mood_weights = MOOD_WEIGHTS[mood]
        shared_film_ids = (
            {film_id for film_id in shared_film_ids
             if mood_score_for_film(film_id, mood_weights) > 0.4}
        )
    
    # Score each shared film: min of individual scores × overlap bonus
    results = []
    for film_id in shared_film_ids:
        individual_scores = [
            user_top_500[film_id]
            for user_top_500 in user_top_500s
            if film_id in user_top_500
        ]
        
        min_score = min(individual_scores)  # Weakest link determines group fit
        avg_score = sum(individual_scores) / len(individual_scores)
        
        # Overlap bonus: higher if everyone has it near the top of their list
        rank_positions = [
            list(u.keys()).index(film_id) / 500
            for u in user_top_500s
            if film_id in u
        ]
        # Low rank position = high in list = good. Average near 0 is better.
        overlap_bonus = 1.0 + (0.5 × (1.0 - sum(rank_positions) / len(rank_positions)))
        
        group_score = min_score × overlap_bonus
        
        results.append(FilmMatch(
            film_id=film_id,
            group_score=group_score,
            individual_scores={
                user.id: score
                for user, score in zip(users, individual_scores)
            }
        ))
    
    return sorted(results, key=lambda x: x.group_score, reverse=True)[:5]
```

**Conflict Mode deviation:**
In Conflict Mode, the algorithm inverts the overlap priority:
- Instead of finding the intersection of top-500s, it finds films in the top-500 of at least ONE user but NOT in any user's top-50 (comfortable zone)
- Additionally filters for films in at least one user's high-confidence unexplored territory
- Returns top 3 (not 5 — the target is more specific)

---

## SECTION 8: COMPLETE API CONTRACT

### 8.1 Base URL & Versioning

```
Production:    https://api.flick.film/v1
Staging:       https://api-staging.flick.film/v1
Development:   http://localhost:3001/v1
```

All responses use the envelope format:
```json
{
  "data": {},
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-04-01T12:00:00Z",
    "version": "1.0"
  },
  "errors": null
}
```

Error responses:
```json
{
  "data": null,
  "meta": { "requestId": "req_abc123", "timestamp": "2026-04-01T12:00:00Z" },
  "errors": [{
    "code": "FILM_NOT_FOUND",
    "message": "Film with id 'xyz' not found.",
    "field": null
  }]
}
```

### 8.2 Authentication Endpoints

| Method | Path | Auth Required | Description |
|--------|------|--------------|-------------|
| POST | `/auth/register` | No | Create account with email/password |
| POST | `/auth/login` | No | Authenticate, receive access + refresh tokens |
| POST | `/auth/refresh` | Refresh token | Rotate refresh token, get new access token |
| POST | `/auth/logout` | Yes | Invalidate current refresh token |
| POST | `/auth/oauth/google` | No | Exchange Google OAuth code for Flick tokens |
| POST | `/auth/oauth/apple` | No | Exchange Apple auth code for Flick tokens |
| POST | `/auth/forgot-password` | No | Send password reset email |
| POST | `/auth/reset-password` | Reset token | Set new password |

**POST /auth/register request:**
```json
{
  "email": "user@example.com",
  "password": "minimumEightChars1!",
  "username": "filmfan_88",
  "displayName": "Jane Smith",
  "countryCode": "GB",
  "birthYear": 1992
}
```

**POST /auth/register response (201):**
```json
{
  "data": {
    "user": {
      "id": "usr_01ABC...",
      "email": "user@example.com",
      "username": "filmfan_88",
      "displayName": "Jane Smith"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "rft_...",
      "expiresIn": 900
    }
  }
}
```

### 8.3 Film Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/films/search` | Optional | Full-text search |
| GET | `/films/:id` | Optional | Film detail (streaming data if auth provided) |
| GET | `/films/:id/streaming` | Yes | Streaming availability for user's country |
| GET | `/films/:id/credits` | No | Full cast and crew |
| GET | `/films/:id/commentary/pre` | Yes | Pre-watch Director's Commentary |
| GET | `/films/:id/commentary/post` | Yes | Post-watch note (403 if not watched) |
| GET | `/films/:id/similar` | Yes | Content-similar films |
| POST | `/films/:id/availability-watch` | Yes | Add to Notify Me tracker |
| DELETE | `/films/:id/availability-watch` | Yes | Remove from Notify Me tracker |

**GET /films/search query parameters:**
```
q          (required) Search query, min 2 chars
page       Cursor for pagination (opaque string)
limit      Results per page (default 20, max 50)
year_min   Minimum release year (1888–present)
year_max   Maximum release year
genre_ids  Comma-separated genre IDs
country    ISO-3166-1 alpha-2 country code (original country)
language   ISO-639-1 language code (original language)
min_rating Minimum TMDb rating (0.0–10.0)
```

**GET /films/:id response (200):**
```json
{
  "data": {
    "film": {
      "id": "flm_...",
      "tmdbId": 496243,
      "imdbId": "tt6751668",
      "title": "Parasite",
      "originalTitle": "기생충",
      "year": 2019,
      "runtimeMinutes": 132,
      "originalLanguage": "ko",
      "countries": [{ "code": "KR", "name": "South Korea" }],
      "genres": [
        { "id": 18, "name": "Drama" },
        { "id": 53, "name": "Thriller" }
      ],
      "synopsis": "...",
      "tagline": "...",
      "posterUrl": "https://cdn.flick.film/posters/flm_xxx.webp",
      "backdropUrl": "https://cdn.flick.film/backdrops/flm_xxx.webp",
      "communityRating": { "tmdb": 8.5, "flick": null },
      "userEntry": null,
      "predictedRating": null,
      "streaming": []
    }
  }
}
```

When authenticated, `userEntry` is populated with the user's library status and `predictedRating` shows the predicted score if the user has ≥ 15 ratings.

### 8.4 Library Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/library` | Yes | Get user's library with filters |
| POST | `/library` | Yes | Add film to library |
| GET | `/library/:entryId` | Yes | Single library entry |
| PATCH | `/library/:entryId` | Yes | Update status, rating, note, date |
| DELETE | `/library/:entryId` | Yes | Remove from library |
| POST | `/library/rewatch` | Yes | Log a rewatch for existing watched film |
| POST | `/library/import/letterboxd` | Yes | Upload Letterboxd CSV |
| GET | `/library/import/:importId` | Yes | Check import job status |
| GET | `/library/stats` | Yes | Computed library statistics |

**POST /library request:**
```json
{
  "filmId": "flm_...",
  "status": "watched",
  "rating": 9.5,
  "watchedAt": "2026-03-28",
  "note": "One of the best I've seen this year.",
  "tags": ["rewatch-candidate", "masterpiece"],
  "isPrivate": false
}
```

**GET /library query parameters:**
```
status         Filter by status (planned|watching|watched|paused|dropped|all)
genre_id       Filter by genre
country        Filter by country of origin
decade         Filter by decade (e.g., 1990)
min_rating     Minimum user rating
sort           date_added|date_watched|rating_asc|rating_desc|title|year_asc|year_desc
cursor         Pagination cursor
limit          Items per page (default 25, max 100)
q              Search within library titles
```

**GET /library/stats response:**
```json
{
  "data": {
    "stats": {
      "totalWatched": 312,
      "totalHours": 589,
      "averageRating": 7.4,
      "thisYear": 47,
      "thisMonth": 8,
      "topGenre": { "id": 80, "name": "Crime", "count": 58 },
      "topDirector": { "id": "prs_...", "name": "Park Chan-wook", "count": 9 },
      "topCountry": { "code": "KR", "name": "South Korea", "count": 62 },
      "favouriteDecade": 1990,
      "rewatchRate": 0.12,
      "ratingDistribution": {
        "1.0": 2, "1.5": 1, "2.0": 4, "2.5": 3,
        "3.0": 8, "3.5": 12, "4.0": 15, "4.5": 18,
        "5.0": 20, "5.5": 22, "6.0": 35, "6.5": 40,
        "7.0": 45, "7.5": 38, "8.0": 30, "8.5": 22,
        "9.0": 15, "9.5": 8, "10.0": 4
      }
    }
  }
}
```

### 8.5 Recommendation Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/recommendations/daily-pick` | Yes | Today's Daily Pick |
| POST | `/recommendations/daily-pick/:filmId/dismiss` | Yes | Dismiss with reason |
| GET | `/recommendations/mood` | Yes | Mood Pick (query: mood, max_runtime, language, platforms) |
| GET | `/recommendations/because-you-loved` | Yes | Films similar to high-rated film |
| GET | `/recommendations/hidden-gems` | Yes | Hidden gems in user's genres |
| GET | `/recommendations/new-releases` | Yes | New releases matched to taste |
| GET | `/recommendations/predictions` | Yes | Your Predictions (min 15 ratings) |
| GET | `/recommendations/outliers` | Yes | Your Outliers |
| GET | `/recommendations/blind-spots` | Yes | Blind Spot Finder results |
| GET | `/recommendations/time-capsule` | Yes | This month's Time Capsule Pick |
| GET | `/recommendations/rewatch-vault` | Yes | Rewatch Vault films |

**GET /recommendations/daily-pick response:**
```json
{
  "data": {
    "picks": [
      {
        "film": { /* film object */ },
        "confidence": "HIGH",
        "convinceMe": {
          "hook": "A family with a perfect plan for social mobility — until the plan starts working too well.",
          "twist": "Bong Joon-ho makes a thriller that's also the funniest film you'll see this year.",
          "personalReason": "You've rated four Korean thrillers above 9.0. This is the one you've been building toward."
        },
        "algorithmVersion": "v2.3.1",
        "pickDate": "2026-04-01"
      }
    ],
    "mode": "single",
    "dismissalsRemainingToday": 3
  }
}
```

When `confidence < 0.5`, `picks` contains 3 films and `mode = "trio"`.

**POST /recommendations/daily-pick/:filmId/dismiss request:**
```json
{
  "reason": "wrong_mood",
  "replacementRequested": true
}
```

**GET /recommendations/mood query parameters:**
```
mood           Required. One of: feel_deeply|turn_off|disturbed|laugh|inspired|tired|transported|haunt
max_runtime    Optional. 90|120|null
language       Optional. any|no_subtitles
platforms      Optional. Comma-separated provider IDs
```

### 8.6 Social Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/social/friends` | Yes | Friend list with visibility settings |
| POST | `/social/friends/request` | Yes | Send friend request |
| POST | `/social/friends/request/:requestId/accept` | Yes | Accept friend request |
| DELETE | `/social/friends/request/:requestId` | Yes | Decline / cancel request |
| DELETE | `/social/friends/:friendId` | Yes | Remove friend |
| POST | `/social/friends/:userId/block` | Yes | Block user |
| PATCH | `/social/friends/:friendId/privacy` | Yes | Update visibility settings |
| GET | `/social/friends/activity` | Yes | Activity feed |
| POST | `/social/friends/activity/:activityId/react` | Yes | Add emoji reaction |
| POST | `/social/matcher` | Yes | Run Movie Night Matcher |
| GET | `/social/users/search` | Yes | Search users by username |

**POST /social/matcher request:**
```json
{
  "friendIds": ["usr_...", "usr_..."],
  "mood": "transported",
  "maxRuntime": 120,
  "languagePref": "any",
  "platforms": null,
  "conflictMode": false
}
```

**POST /social/matcher response:**
```json
{
  "data": {
    "matches": [
      {
        "film": { /* film object */ },
        "groupScore": 0.87,
        "individualScores": {
          "usr_self": 9.2,
          "usr_friend1": 8.8,
          "usr_friend2": 9.0
        },
        "groupReason": "All three of you rate slow-burn thrillers highly. This one has the widest consensus among people with your combined taste.",
        "streaming": []
      }
    ],
    "mode": "standard",
    "friendCount": 3
  }
}
```

---

## SECTION 9: RISK REGISTER

All risks are rated by Probability (P: 1–5) and Impact (I: 1–5). Risk Score = P × I. Scores ≥ 12 are HIGH and require mitigation before the associated phase begins.

### 9.1 Technical Risks

| # | Risk | P | I | Score | Mitigation |
|---|------|---|---|-------|-----------|
| T1 | TMDb API deprecates Watch Providers endpoint or changes pricing | 2 | 5 | 10 | Watchmode as fallback; abstraction layer in `FilmDataService` so provider can be swapped |
| T2 | Recommendation engine produces poor results at low user counts (cold start) | 4 | 4 | 16 | **HIGH.** Content-based Layer 1 designed for day-one quality; extensive pre-launch testing with synthetic user profiles; threshold gates prevent L2/L3 from activating prematurely |
| T3 | Gemini API latency spikes affect Convince Me card generation | 3 | 3 | 9 | All AI copy is cached per film × user; async generation with instant template fallback; 500ms SLA enforced via timeout |
| T4 | Letterboxd changes CSV export format, breaking import | 2 | 4 | 8 | Import parser is isolated module with integration test against real CSV samples; format monitored with a nightly canary test |
| T5 | Privacy bug exposes hidden film data to friends | 1 | 5 | 5 | Hidden film filter applied at DB query level, not application level; automated security test suite covers all privacy paths; penetration test in Phase 4 |
| T6 | Database query performance degrades with user growth | 3 | 4 | 12 | Comprehensive indexing strategy from Phase 0; slow query log monitoring; automated performance regression tests run before each phase release |
| T7 | ML model retraining pipeline fails silently | 2 | 3 | 6 | Model training results logged; Sentry alerts on training job failure; previous model remains active (frozen degradation, not broken product) |
| T8 | React Native upgrade breaks existing components | 2 | 3 | 6 | Pin major versions; upgrade in Phase 5 (Polish) not mid-feature work; Detox E2E test suite catches regressions |
| T9 | App Store rejection at submission (Phase 6) | 2 | 4 | 8 | Apple/Google guideline review in Phase 5; TestFlight beta validates requirements; no known edge cases in feature set |

### 9.2 Product Risks

| # | Risk | P | I | Score | Mitigation |
|---|------|---|---|-------|-----------|
| P1 | Daily Pick quality insufficient to drive user retention | 3 | 5 | 15 | **HIGH.** Beta test with 500 real users before launch; A/B test algorithm variants throughout Phase 2; "Was this pick relevant?" feedback loop built into every pick |
| P2 | Letterboxd import fails for large libraries (1000+ films), causing user frustration | 3 | 4 | 12 | Import tested with 100/500/1000/2500-film CSVs; async processing with progress indicator; partial success (import what matched, review what didn't) |
| P3 | Collaborative filtering requires more users than projected before it meaningfully activates | 3 | 3 | 9 | Layer 1 alone is the value proposition for the first 6+ months; L2 improvement is upside, not baseline |
| P4 | User acquisition slower than projected, limiting network effects for social features | 3 | 4 | 12 | Social features (Phase 4) de-risked by being independent of user count; Matcher works with as few as 2 users; growth targets include buffer |
| P5 | Tone of AI-generated Convince Me copy feels generic or machine-generated | 3 | 4 | 12 | Human editorial review of 50 generated examples per week in Phase 2; system prompt iteration; fallback to manually-written copy for top 500 films |
| P6 | Regional cinema users find recommendation quality inadequate for their traditions | 4 | 4 | 16 | **HIGH.** Onboarding OB-2 specifically seeds regional taste; beta includes testers from IN, KR, NG markets; TMDb keyword vocabulary includes non-English cinema tags; dedicated quality audit per region before launch |
| P7 | Mood History violates user expectation of complete privacy | 1 | 5 | 5 | Mood History is private-only, no sharing mechanism exists; privacy policy explicitly covers this; feature never mentioned in social context |
| P8 | Weekly Digest unsubscribe rate very high, flagging emails as spam | 2 | 4 | 8 | 4-item maximum constraint; plain-text-inspired design (not heavy HTML); adaptive send time prevents off-peak delivery; easy one-click unsubscribe |

### 9.3 Business & Legal Risks

| # | Risk | P | I | Score | Mitigation |
|---|------|---|---|-------|-----------|
| B1 | "Flick" trademark conflicts in target markets (US, UK, IN, AU) | 2 | 5 | 10 | Trademark search before any public launch; "Kino" identified as strong fallback; legal review in Phase 0 |
| B2 | TMDb commercial licence requirements not met | 2 | 4 | 8 | Review TMDb Terms of Service before any public-facing work; commercial API access if required; attribution requirements met on all film pages |
| B3 | GDPR non-compliance creates regulatory exposure | 1 | 5 | 5 | Privacy by default architecture; data export and deletion implemented in Phase 1; legal review of privacy policy and data handling in Phase 0 |
| B4 | Key personnel departure mid-project (especially ML engineer) | 2 | 4 | 8 | All algorithm decisions documented in this PRD; code written to be readable and maintainable; ML service is isolated and well-tested |
| B5 | Streaming availability data consistently inaccurate, eroding user trust | 3 | 4 | 12 | 24-hour re-verification before digest sends; "verified at [time]" display; never-send-unverified policy encoded as non-negotiable requirement |

---

## SECTION 10: DATA PRIVACY & COMPLIANCE

### 10.1 GDPR Compliance

Flick operates under GDPR (EU/UK) as the primary data protection framework. All other markets (IN, AU, US) are served under the same privacy standards — stricter than required in those jurisdictions but operationally simpler and ethically correct.

**Legal basis for data processing:**

| Data Type | Legal Basis | Retention |
|-----------|-------------|-----------|
| Account details (email, username) | Contract performance | Duration of account + 30 days |
| Film ratings and watch history | Contract performance (core product function) | Duration of account + 30 days |
| Taste profile | Contract performance | Duration of account + 30 days |
| Push notification tokens | Legitimate interest | Until replaced or revoked |
| Session analytics (PostHog) | Legitimate interest | 2 years, anonymised |
| AI-generated Convince Me cache | Contract performance | 90 days, regenerated on change |
| Mood History | Contract performance | Duration of account |
| Crash report data (Sentry) | Legitimate interest | 30 days |

**Right to Erasure (Article 17 GDPR):**

When a user requests account deletion:
1. User submits a deletion request via Profile → Settings → Delete Account
2. 30-day grace period begins. User receives email confirmation of the request.
3. During the grace period, the user can cancel the deletion.
4. After 30 days: all records referencing `user_id` are deleted or anonymised.
5. Deletion cascade: `users`, `taste_profiles`, `user_film_entries`, `mood_sessions`, `daily_picks`, `friendships`, `friend_visibility`, `availability_watches` — all hard deleted.
6. `recommendation_events` rows are anonymised (user_id set to NULL, retained for model training integrity)
7. User receives email confirmation: "Your account has been permanently deleted."
8. Deletion is reflected in Firebase Authentication within 24 hours.

**Right to Portability (Article 20 GDPR):**

Users can request a complete data export via Profile → Settings → Export My Data. The export is generated asynchronously and delivered as a ZIP file download link via email within 24 hours (not an arbitrary 30-day SLA).

Export contents:
```
flick-export-{username}-{date}.zip
├── account.json           (email, username, created_at, country)
├── library.json           (all film entries with ratings, dates, notes, tags)
├── taste_profile.json     (genre weights, region prefs, tone/pace)
├── mood_history.json      (all mood sessions)
├── lists.json             (user-created collections)
└── README.txt             (format explanation, how to import)
```

**Consent management:**
- Email marketing (digest, feature announcements): explicit opt-in. User shown clear consent request in onboarding. Can revoke at any time via Settings → Notifications.
- Push notifications: OS-level permission requested when push is first used (Phase 1). User can revoke any time in Settings → Notifications.
- AI content generation: disclosed in Privacy Policy that film pages may include AI-generated content using film metadata (not user data). No model training on user data.

### 10.2 Children's Privacy

Flick is rated 12+ on both App Stores. The app does not knowingly collect data from users under 13. At registration, `birthYear` is collected. If computed age < 13: registration is rejected with a message. If birthYear indicates age 13–17: a simplified privacy notice is shown explaining parental consent may be required in some jurisdictions.

No marketing or analytics profiling is performed on users identified as being under 18.

### 10.3 Data Security

**Encryption:**

| Data State | Standard |
|-----------|---------|
| In transit | TLS 1.3 minimum (enforced at load balancer level) |
| At rest — database | Cloud SQL encrypted at rest using Google-managed encryption keys |
| At rest — PII fields | Email, username, birth_year stored with application-level AES-256 encryption using keys from Secret Manager (defence-in-depth beyond Google's infrastructure encryption) |
| Backup data | Same encryption standards as primary, backups retained 30 days |
| Logs | Log entries containing userId are treated as PII; no film titles or ratings in logs (only film_ids) |

**Access control:**

| System | Access Policy |
|--------|--------------|
| Production database | Engineers cannot query production directly. All production access via Cloud SQL Auth Proxy with individual IAM credentials. All queries logged. |
| Secret Manager | Principle of least privilege. Service accounts have access only to the secrets they need. No shared service account keys. |
| Cloud Storage (user assets) | Signed URLs with 1-hour expiry for all served media. No public bucket access. |
| Admin dashboard | Separate authentication domain. Requires internal Google account + 2FA. No production data visible by default (only aggregated stats). |

**Vulnerability management:**
- Snyk dependency scanning: every PR, automated alerts for critical CVEs
- OWASP Top 10 review: documented sign-off at end of Phase 1 and Phase 4
- Penetration test: external pen test in Phase 5 (before public launch), targeting: API authentication, privacy model, input validation, rate limiting
- Bug bounty: considered for post-launch, not at launch

---

## SECTION 11: CONTENT QUALITY STANDARDS

### 11.1 AI-Generated Content Quality Gates

All AI-generated content (Convince Me cards, Director's Commentary, Time Capsule framing) must pass the following quality gates before being served to users.

**Convince Me card gates:**
- Word count: Hook ≤ 50 words, Twist ≤ 50 words, Personal Reason ≤ 60 words
- No spoilers: content is run through a keyword check for common spoiler patterns ("twist ending", "dies at the end", character names + verbs suggesting plot events)
- No hallucination check: film title, director name, and key cast names referenced in generated copy must exactly match the metadata provided as input
- Fallback: if any gate fails, template v1 copy is served. Failure is logged and reviewed.

**Director's Commentary — Pre-Watch gates:**
- Contains no plot events after the first act (system prompt + keyword audit)
- Word count: 150–200 (hard limit enforced by server-side truncation + audit)
- References only the films, directors, and years provided as facts in the prompt (no hallucination of unrelated films)
- Not generated for films with `metadata_quality_score < 0.7`

**Director's Commentary — Post-Watch gates:**
- Word count: 300–400
- Must reference at least one specific scene, theme, or character without naming it if it may constitute a spoiler for the title in question (system prompt enforced)
- Passes the same hallucination check as above

**Time Capsule framing gates:**
- Word count: 150–200
- Year referenced in copy must match the target year (never off by more than 2 years)
- No political content beyond neutral historical context of cinema
- Not generated if target year's film pool has fewer than 5 qualifying films (fallback: show film without framing, note "Not enough films from this year to generate your Time Capsule")

**Human review process:** A random sample of 5% of all AI-generated content is reviewed weekly by a designated team member. A quality score (1–5) is assigned. Scores below 3 trigger a prompt improvement review.

### 11.2 Film Data Quality Tiers

Film data quality directly affects which features are available for a given film. Quality is determined by `metadata_quality_score`, computed as follows:

```python
def compute_metadata_quality_score(film: Film) -> float:
    score = 0.0
    
    # Core fields (must-haves)
    if film.title:                score += 0.10
    if film.release_date:         score += 0.10
    if film.runtime_minutes:      score += 0.08
    if film.synopsis:             score += 0.10
    if film.poster_path:          score += 0.08
    if film.average_vote > 0:     score += 0.05
    
    # Enrichment (nice-to-haves)
    if film.vote_count > 1000:    score += 0.10
    if film.vote_count > 10000:   score += 0.05
    if film.vote_count > 50000:   score += 0.05
    if film.tagline:              score += 0.03
    if film.genres and len(film.genres) >= 2:  score += 0.08
    if film.director:             score += 0.08
    if film.keywords and len(film.keywords) >= 5:  score += 0.08
    if film.original_language:    score += 0.02
    if film.countries:            score += 0.02
    
    return min(1.0, score)
```

| Score Range | Tier | Features Available |
|------------|------|--------------------|
| 0.8–1.0 | Platinum | All features: Layer 1 scoring, Convince Me AI, Director's Commentary, Blind Spot, Rabbit Hole deep-dive |
| 0.6–0.79 | Gold | Layer 1 scoring, template Convince Me, Blind Spot inclusion, basic person page |
| 0.4–0.59 | Silver | Searchable and addable to library, basic film card, no Convince Me, no Commentary |
| 0.0–0.39 | Bronze | Searchable, basic display only. Not shown in any recommendation row. |

Users are shown this tier information transparently on the film detail page as a small indicator: "Limited information available for this film" for Bronze/Silver tier films.

---

## SECTION 12: INTERNATIONALISATION (i18n)

### 12.1 Launch Language

**Version 1.0 launches in English only.** UI copy, editorial content, and all notifications are in English. This is an explicit scope decision, not an oversight.

The codebase is architected for i18n from day one (using `react-i18next` for mobile, `next-i18next` for web), but no translation work is performed until Phase 7 or later, based on user base data.

### 12.2 Country & Currency Support

Film data (titles, synopses, metadata) is displayed in its original language when no English translation is available in TMDb. This is a deliberate choice: a Korean film with no English data shows its Korean title and Korean synopsis. The app does not break when encountering non-Latin scripts.

Streaming availability is always country-specific (using the user's registered country code). Rental/purchase prices displayed are in the user's local currency where available from the streaming provider's API data.

### 12.3 Date & Time Formatting

All dates displayed to users use the user's system locale for formatting. The backend stores and transmits all dates in ISO 8601 UTC. The client formats for display. Example: `2026-03-28T00:00:00Z` displays as "28 March 2026" to a UK user and "March 28, 2026" to a US user.

Adaptive digest send time is calculated in the user's local timezone (derived from device timezone, stored in `users.timezone` column).

---

*End of Part 4.*
*This document is the definitive technical and product specification for the Flick recommendation engine, API contract, risk register, and compliance requirements.*
*All engineers should read Sections 7 and 8 before beginning any algorithm or API work.*
*All changes to this document require PM and Engineering Lead sign-off.*
