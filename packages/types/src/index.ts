// ============================================================
// Flick — Shared TypeScript Types
// ============================================================

// ==============================
// Core Database Types
// ==============================

export type OnboardingPhase = 0 | 1 | 2;

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country_code: string | null;
  birth_year: number | null;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TasteProfile {
  user_id: string;
  format_prefs: FormatPrefs;
  region_prefs: RegionPrefs;
  pace_slider: number; // 0-1
  tone_slider: number; // 0-1
  genre_loves: number[];
  genre_hates: number[];
  adventurousness: number; // 0-1
  primary_intent: PrimaryIntent | null;
  onboarding_phase: OnboardingPhase;
  capsule_year: number | null;
  updated_at: string;
}

export interface FormatPrefs {
  live_action?: boolean;
  animation?: boolean;
  anime?: boolean;
}

export interface RegionPrefs {
  [regionCode: string]: boolean;
}

export type PrimaryIntent = 'transported' | 'think' | 'feel' | 'fun';

export interface Film {
  id: string;
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  original_title: string | null;
  release_year: number | null;
  runtime_minutes: number | null;
  original_language: string | null;
  countries: string[];
  genres: number[];
  synopsis: string | null;
  tagline: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  tmdb_rating: number | null;
  tmdb_vote_count: number;
  keywords: string[];
  content_rating: string | null;
  adult: boolean;
  metadata_quality_score: number;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  tmdb_person_id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string | null;
  biography: string | null;
  birthday: string | null;
}

export type FilmRole = 'director' | 'actor' | 'writer' | 'cinematographer' | 'composer' | 'producer';

export interface FilmPerson {
  film_id: string;
  person_id: string;
  role: FilmRole;
  character_name: string | null;
  billing_order: number | null;
  person?: Person;
}

export type LibraryStatus = 'planned' | 'watching' | 'watched' | 'paused' | 'dropped';

export interface UserFilmEntry {
  id: string;
  user_id: string;
  film_id: string;
  status: LibraryStatus;
  rating: number | null; // 0.5–10.0 in 0.5 increments
  personal_note: string | null;
  date_watched: string | null;
  rewatch_number: number;
  is_hidden: boolean;
  custom_tags: string[];
  created_at: string;
  updated_at: string;
  film?: Film;
}

export type StreamType = 'subscription' | 'rent' | 'buy' | 'free';

export interface StreamingAvailability {
  id: string;
  film_id: string;
  country_code: string;
  platform_id: number;
  platform_name: string;
  logo_path: string | null;
  stream_type: StreamType;
  stream_url: string | null;
  verified_at: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Friendship {
  id: string;
  user_id_a: string;
  user_id_b: string;
  status: FriendshipStatus;
  initiated_by: string;
  visibility_a: VisibilitySettings;
  visibility_b: VisibilitySettings;
  created_at: string;
  accepted_at: string | null;
}

export interface VisibilitySettings {
  ratings: boolean;
  watchlist: boolean;
  recent_watches: boolean;
  collections: boolean;
}

export interface UserList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  cover_film_id: string | null;
  created_at: string;
  updated_at: string;
  film_count?: number;
}

export interface ListFilm {
  list_id: string;
  film_id: string;
  sort_order: number;
  note: string | null;
  added_at: string;
  film?: Film;
}

// ==============================
// Recommendation Types
// ==============================

export type MoodType =
  | 'something_light'
  | 'edge_of_seat'
  | 'good_cry'
  | 'mind_blown'
  | 'felt_seen'
  | 'laugh_hard'
  | 'beautifully_made'
  | 'off_the_radar';

export type DismissReason = 'wrong_mood' | 'already_seen' | 'not_interested';

export type DailyPickAction = 'watched' | 'dismissed' | 'ignored' | 'added_watchlist';

export interface ConvinceMe {
  hook: string;
  twist: string;
  personal_reason: string;
  is_ai_generated: boolean;
}

export interface DailyPick {
  id: string;
  user_id: string;
  pick_date: string;
  film_id: string;
  confidence_score: number;
  confidence_level: 'low' | 'medium' | 'high';
  convince_me: ConvinceMe | null;
  algorithm_version: string;
  layers_used: string[];
  action_taken: DailyPickAction | null;
  dismissed_at: string | null;
  dismiss_reason: DismissReason | null;
  film?: Film;
}

export interface FilmVector {
  film_id: string;
  genre_vector: number[];
  tone_score: number;
  pace_score: number;
  runtime_bucket: number | null;
  format_type: string | null;
  keyword_vector: number[];
}

export interface UserTasteVector {
  user_id: string;
  genre_vector: number[];
  tone_target: number;
  pace_target: number;
  keyword_affinity: number[];
  confidence: number;
  ratings_count: number;
  updated_at: string;
}

// ==============================
// Activity Types
// ==============================

export type ActivityType = 'watched' | 'rated' | 'added_planned' | 'collection_created' | 'rewatch';

export interface FriendActivity {
  id: string;
  user_id: string;
  type: ActivityType;
  film_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  profile?: Profile;
  film?: Film;
  reactions?: ActivityReaction[];
}

export interface ActivityReaction {
  activity_id: string;
  user_id: string;
  emoji: string; // 👍❤️😮🤣😢
  created_at: string;
  profile?: Profile;
}

// ==============================
// API Response Types
// ==============================

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  cursor: string | null;
  has_more: boolean;
  total?: number;
}

export interface LibraryStats {
  total_watched: number;
  total_planned: number;
  total_hours: number;
  average_rating: number | null;
  this_year: number;
  this_month: number;
  rewatch_count: number;
  ratings_count: number;
}

// ==============================
// Useful Utility Types
// ==============================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// TMDb genre ID map (for reference)
export const TMDB_GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};
