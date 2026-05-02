/**
 * Flick AI Service — Gemini Integration
 *
 * Responsible for "Convince Me" blurbs: a 2–3 sentence personalised pitch
 * explaining WHY this film was picked for *this specific user*.
 *
 * Token-saving strategy:
 *   1. Check Redis for a cached blurb (keyed by userId + filmId).
 *   2. On cache miss, build a compact system prompt + user context payload.
 *   3. Call Gemini gemini-1.5-flash (fastest, cheapest) via REST.
 *   4. Persist result in Redis for 7 days.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config.js';
import { redis } from '../lib/redis.js';
import { supabaseAdmin } from '../lib/supabase.js';

const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days
const MODEL_NAME = 'gemini-1.5-flash';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// ─── Genre map (compact for prompt) ────────────────────────────────────────
const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

function genreNames(ids: number[]): string {
  return ids.map(id => GENRE_MAP[id] || id).join(', ');
}

// ─── Intent to human-readable ───────────────────────────────────────────────
const INTENT_LABELS: Record<string, string> = {
  transported: 'escape reality and be transported to another world',
  think: 'be intellectually challenged and made to think deeply',
  feel: 'experience deep emotions and feel deeply moved',
  fun: 'have fun and enjoy a lighthearted experience',
};

// ─── Slim taste context builder ─────────────────────────────────────────────
async function buildTasteContext(userId: string): Promise<string> {
  const { data: taste } = await supabaseAdmin
    .from('taste_profiles')
    .select('genre_loves, genre_hates, primary_intent, director_familiarity, pace_slider, tone_slider')
    .eq('user_id', userId)
    .single();

  if (!taste) return 'No detailed taste profile available.';

  const parts: string[] = [];

  if (taste.primary_intent) {
    parts.push(`Primary intent: ${INTENT_LABELS[taste.primary_intent] || taste.primary_intent}`);
  }
  if (taste.genre_loves?.length) {
    parts.push(`Loved genres: ${genreNames(taste.genre_loves)}`);
  }
  if (taste.genre_hates?.length) {
    parts.push(`Disliked genres: ${genreNames(taste.genre_hates)}`);
  }
  if (taste.pace_slider != null) {
    const paceLabel = taste.pace_slider >= 7 ? 'fast-paced' : taste.pace_slider <= 3 ? 'slow-burn' : 'balanced tempo';
    parts.push(`Prefers ${paceLabel} films`);
  }
  if (taste.tone_slider != null) {
    const toneLabel = taste.tone_slider >= 7 ? 'uplifting/light tone' : taste.tone_slider <= 3 ? 'dark/heavy tone' : 'balanced tone';
    parts.push(`Prefers ${toneLabel}`);
  }
  if (taste.director_familiarity?.length) {
    parts.push(`Familiar with directors: ${taste.director_familiarity.slice(0, 5).join(', ')}`);
  }

  return parts.join('. ') + '.';
}

// ─── Main exported function ──────────────────────────────────────────────────
export interface ConvinceMeResult {
  pitch: string;
  cached: boolean;
}

export async function getConvinceMe(
  userId: string,
  filmId: string,
  filmTitle: string,
  filmYear: number,
  filmGenres: number[],
  filmSynopsis: string | null,
  tmdbRating: number,
): Promise<ConvinceMeResult> {
  const cacheKey = `convince_me:${userId}:${filmId}`;

  // 1. Cache hit
  const cached = await redis.get<string>(cacheKey);
  if (cached) return { pitch: cached, cached: true };

  // 2. Build compact prompt
  const tasteContext = await buildTasteContext(userId);
  const synopsis = filmSynopsis
    ? filmSynopsis.slice(0, 200) // Keep it short for token budget
    : 'No synopsis available.';

  const prompt = `You are Flick, a sophisticated personal cinema guide.
A user's taste profile: ${tasteContext}

The film you are pitching: "${filmTitle}" (${filmYear}), genres: ${genreNames(filmGenres)}, TMDb rating: ${tmdbRating}/10.
Synopsis: ${synopsis}

Write a 2–3 sentence personalised pitch explaining exactly why THIS film was chosen specifically for this user, referencing their taste. 
Use second-person ("you", "your"). Be confident, specific, and cinephile-sharp. Do NOT use clichés like "breathtaking" or "masterpiece". Output only the pitch text, no quotes, no labels.`;

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const pitch = result.response.text().trim();

    // 3. Cache result
    await redis.set(cacheKey, pitch, { ex: CACHE_TTL });

    return { pitch, cached: false };
  } catch (err) {
    console.error('[Gemini] convince_me error:', err);
    // Graceful fallback: surface a basic pitch so the UI never breaks
    const fallback = `${filmTitle} was picked because it aligns closely with your genre preferences and viewing intent. With a ${tmdbRating}/10 rating, it's one of the strongest matches we found for you today.`;
    return { pitch: fallback, cached: false };
  }
}

// ─── Phase 3 Sprint 3.3: Time Capsule ───────────────────────────────────────
export async function getTimeCapsuleCopy(
  year: number,
  filmTitle: string,
  filmSynopsis: string | null
): Promise<string> {
  const prompt = `You are Flick, a sophisticated personal cinema guide.
I want you to write a "Time Capsule" introduction for the year ${year} and the film "${filmTitle}".

Write two elegant, concise paragraphs:
1. The first paragraph should vividly describe the cultural mood, world events, or cinema landscape of the year ${year}.
2. The second paragraph should explain how "${filmTitle}" perfectly captured that moment in time or defined the era, acting as a bridge to the past.

Synopsis for context: ${filmSynopsis || 'N/A'}.
Keep it evocative, cinematic, and under 150 words total. Do not use generic filler.`;

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('[Gemini] time_capsule error:', err);
    return `In ${year}, the world was shifting, and cinema was reflecting those changes in real-time. "${filmTitle}" stands as a fascinating document of its era, capturing themes and anxieties of the moment that still resonate today.`;
  }
}

// ─── Phase 3 Sprint 3.4: Director's Commentary ─────────────────────────────
export async function generateCommentary(
  filmTitle: string,
  synopsis: string | null,
  type: 'pre' | 'post'
): Promise<string> {
  const isPre = type === 'pre';
  
  const instruction = isPre
    ? `Write a "Pre-watch Primer". Give the user 2-3 specific things to pay attention to (e.g., repeating motifs, a stylistic choice, or an actor's subtle habit) without ANY spoilers. Set the mood.`
    : `Write a "Post-watch Debrief". Dive into the ending, the underlying thematic meaning, and interesting trivia or director's intent. Spoilers are REQUIRED and expected here. Break down what it all meant.`;

  const prompt = `You are Flick, a curated cinema companion.
Film: "${filmTitle}"
Synopsis: ${synopsis || 'N/A'}

${instruction}
Keep the tone intelligent, engaging, and cinephile-friendly. Give a single, well-structured paragraph (max 150 words).`;

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error(`[Gemini] commentary ${type} error:`, err);
    return isPre
      ? `Pay close attention to the visual framing and the score. The director uses them to tell a parallel story you might miss on the first glance.`
      : `The ambiguous ending is entirely intentional, meant to reflect the protagonist's unresolved internal conflict. It's a film that demands you bring your own meaning to its final frames.`;
  }
}
