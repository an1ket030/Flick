import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { env } from '../config.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Use Flash for speed + free tier (15 RPM limit)
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
});

export interface ConvinceMeResult {
  hook: string;          // One punchy sentence to grab attention
  twist: string;         // One sentence about what makes it unique/unexpected
  personal_reason: string; // One sentence personalised to this user's taste
}

export async function generateConvinceMe(
  film: {
    title: string;
    release_year: number | null;
    genres: number[];
    synopsis: string | null;
    tmdb_rating: number | null;
    original_language: string | null;
  },
  userTaste: {
    top_genres: string[];
    primary_intent: string | null;
    tone_label: string;
  }
): Promise<ConvinceMeResult> {
  const prompt = `
You are a passionate film critic writing for the Flick app. Generate a "Convince Me" card for this film.

Film: "${film.title}" (${film.release_year ?? 'Unknown year'})
Synopsis: ${film.synopsis ?? 'No synopsis available'}
TMDb Rating: ${film.tmdb_rating ?? 'N/A'}
Language: ${film.original_language ?? 'Unknown'}

User's taste profile:
- Loves these genres: ${userTaste.top_genres.join(', ')}
- Watching intent: ${userTaste.primary_intent ?? 'entertainment'}
- Prefers films that feel: ${userTaste.tone_label}

Write exactly 3 short sentences:
1. HOOK: A punchy, enticing opening sentence (max 20 words). No spoilers.
2. TWIST: What makes this film unique or surprising (max 20 words). No spoilers.
3. PERSONAL: Why THIS user specifically would love it, based on their taste (max 25 words). No spoilers.

Rules:
- Never mention the film's title or director in the hook
- Do NOT reveal plot twists or endings
- Sound like an enthusiastic friend, not a review bot
- Return ONLY a JSON object like: {"hook":"...","twist":"...","personal_reason":"..."}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini returned invalid JSON format');

  const parsed = JSON.parse(jsonMatch[0]) as ConvinceMeResult;

  // Validate word counts
  if (!parsed.hook || !parsed.twist || !parsed.personal_reason) {
    throw new Error('Gemini response missing required fields');
  }

  return parsed;
}

export async function generatePreWatchCommentary(film: {
  title: string;
  release_year: number | null;
  synopsis: string | null;
  genres: number[];
  director_name?: string;
}): Promise<string> {
  const prompt = `
Write a "Watch it better" pre-watch note for "${film.title}" (${film.release_year ?? ''}).
Director: ${film.director_name ?? 'Unknown'}
Synopsis: ${film.synopsis ?? 'N/A'}

Write 150-200 words in the voice of an insightful film critic:
- Explain what thematic elements to notice while watching
- Mention the visual style or directing approach
- Prime the viewer to appreciate what makes it special
- NO plot spoilers whatsoever
- No star ratings or scores
- Warm, curious tone — like a knowledgeable friend preparing you for the film
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function generatePostWatchCommentary(film: {
  title: string;
  release_year: number | null;
  synopsis: string | null;
  director_name?: string;
}): Promise<string> {
  const prompt = `
Write a "After the credits" post-watch analysis for "${film.title}" (${film.release_year ?? ''}).
Director: ${film.director_name ?? 'Unknown'}
Synopsis: ${film.synopsis ?? 'N/A'}

Write 300-400 words for viewers who just finished the film:
- Deep thematic analysis with scene references (acceptable to discuss plot endings now)
- Director's intent and stylistic choices
- Cultural or historical context
- What questions/ideas the film leaves you with
- Warm, intellectually engaged tone — film lover to film lover
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
