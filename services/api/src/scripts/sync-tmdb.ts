/**
 * Flick — TMDb Data Sync Script
 * Fetches popular, top-rated, and region-specific films from TMDb
 * and upserts them into Supabase with quality scoring.
 *
 * Run: npx tsx src/scripts/sync-tmdb.ts [--limit 100]
 * Scheduled: GitHub Actions nightly cron (2am UTC)
 */

import { createClient } from '@supabase/supabase-js';

// Read env directly (no config.ts dependency for standalone script)
const SUPABASE_URL = process.env['SUPABASE_URL']!;
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']!;
const TMDB_API_TOKEN = process.env['TMDB_API_TOKEN']!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TMDB_API_TOKEN) {
  console.error('❌ Missing required env vars. Check SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TMDB_API_TOKEN');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TMDB_BASE = 'https://api.themoviedb.org/3';
const HEADERS = {
  Authorization: `Bearer ${TMDB_API_TOKEN}`,
  'Content-Type': 'application/json',
};

// Countries to fetch Watch Providers for
const PROVIDER_COUNTRIES = ['US', 'GB', 'IN', 'AU', 'CA', 'DE', 'FR', 'JP'];

// Quality score computation (mirrors PRD §11)
function computeQualityScore(film: TmdbFilm, hasDirector: boolean, keywords: string[]): number {
  let score = 0;
  if (film.title) score += 0.10;
  if (film.release_date) score += 0.10;
  if (film.runtime) score += 0.08;
  if (film.overview && film.overview.length > 50) score += 0.10;
  if (film.poster_path) score += 0.08;
  if (film.vote_average && film.vote_average > 0) score += 0.05;
  if (film.vote_count > 1000) score += 0.10;
  if (film.vote_count > 10000) score += 0.05;
  if (film.vote_count > 50000) score += 0.05;
  if (film.tagline) score += 0.03;
  if (film.genres && film.genres.length >= 2) score += 0.08;
  if (hasDirector) score += 0.08;
  if (keywords.length >= 5) score += 0.08;
  return Math.min(1.0, score);
}

interface TmdbFilm {
  id: number;
  imdb_id?: string;
  title: string;
  original_title: string;
  overview: string;
  tagline?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  original_language: string;
  production_countries: Array<{ iso_3166_1: string }>;
  genres: Array<{ id: number; name: string }>;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  keywords?: { keywords: Array<{ id: number; name: string }> };
  credits?: {
    crew: Array<{ job: string; name: string; id: number }>;
    cast: Array<{ id: number; name: string; character: string; order: number; profile_path: string | null }>;
  };
  'watch/providers'?: {
    results: Record<string, {
      flatrate?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      rent?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      buy?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      free?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
    }>;
  };
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 429) {
        // Rate limited — wait and retry
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error(`Failed after ${retries} retries: ${url}`);
}

async function fetchFilmDetails(tmdbId: number): Promise<TmdbFilm | null> {
  try {
    const url = `${TMDB_BASE}/movie/${tmdbId}?append_to_response=keywords,credits,watch/providers`;
    const res = await fetchWithRetry(url);
    return await res.json() as TmdbFilm;
  } catch (err) {
    console.warn(`⚠️  Skipping TMDb ID ${tmdbId}:`, (err as Error).message);
    return null;
  }
}

async function getOrCreatePerson(tmdbPersonId: number, name: string, profilePath: string | null) {
  const { data: existing } = await supabase
    .from('persons')
    .select('id')
    .eq('tmdb_person_id', tmdbPersonId)
    .single();

  if (existing) return existing.id as string;

  const { data: created, error } = await supabase
    .from('persons')
    .insert({ tmdb_person_id: tmdbPersonId, name, profile_path: profilePath, known_for_department: 'Directing' })
    .select('id')
    .single();

  if (error) {
    console.warn(`⚠️  Could not create person ${name}:`, error.message);
    return null;
  }
  return created?.id as string | null;
}

async function upsertFilm(tmdbFilm: TmdbFilm): Promise<string | null> {
  const keywords = (tmdbFilm.keywords?.keywords ?? []).map(k => k.name);
  const crew = tmdbFilm.credits?.crew ?? [];
  const cast = tmdbFilm.credits?.cast ?? [];
  const director = crew.find(c => c.job === 'Director');
  const hasDirector = Boolean(director);

  const releaseYear = tmdbFilm.release_date
    ? parseInt(tmdbFilm.release_date.substring(0, 4), 10)
    : null;

  const qualityScore = computeQualityScore(tmdbFilm, hasDirector, keywords);

  // Upsert film
  const { data: film, error: filmErr } = await supabase
    .from('films')
    .upsert({
      tmdb_id: tmdbFilm.id,
      imdb_id: tmdbFilm.imdb_id ?? null,
      title: tmdbFilm.title,
      original_title: tmdbFilm.original_title,
      release_year: releaseYear,
      runtime_minutes: tmdbFilm.runtime,
      original_language: tmdbFilm.original_language,
      countries: tmdbFilm.production_countries.map(c => c.iso_3166_1),
      genres: tmdbFilm.genres.map(g => g.id),
      synopsis: tmdbFilm.overview || null,
      tagline: tmdbFilm.tagline || null,
      poster_path: tmdbFilm.poster_path,
      backdrop_path: tmdbFilm.backdrop_path,
      tmdb_rating: tmdbFilm.vote_average,
      tmdb_vote_count: tmdbFilm.vote_count,
      keywords,
      adult: tmdbFilm.adult,
      metadata_quality_score: qualityScore,
    }, { onConflict: 'tmdb_id' })
    .select('id')
    .single();

  if (filmErr || !film) {
    console.warn(`⚠️  Film upsert failed for ${tmdbFilm.title}:`, filmErr?.message);
    return null;
  }

  const filmId = film.id as string;

  // Upsert director
  if (director) {
    const personId = await getOrCreatePerson(director.id, director.name, null);
    if (personId) {
      await supabase.from('film_persons').upsert(
        { film_id: filmId, person_id: personId, role: 'director', billing_order: 0 },
        { onConflict: 'film_id,person_id,role' }
      );
    }
  }

  // Upsert top 6 cast members
  for (const actor of cast.slice(0, 6)) {
    const personId = await getOrCreatePerson(actor.id, actor.name, actor.profile_path);
    if (personId) {
      await supabase.from('film_persons').upsert(
        {
          film_id: filmId,
          person_id: personId,
          role: 'actor',
          character_name: actor.character || null,
          billing_order: actor.order,
        },
        { onConflict: 'film_id,person_id,role' }
      );
    }
  }

  // Upsert writer
  const writer = crew.find(c => c.job === 'Screenplay' || c.job === 'Writer');
  if (writer) {
    const personId = await getOrCreatePerson(writer.id, writer.name, null);
    if (personId) {
      await supabase.from('film_persons').upsert(
        { film_id: filmId, person_id: personId, role: 'writer', billing_order: 0 },
        { onConflict: 'film_id,person_id,role' }
      );
    }
  }

  // Upsert streaming providers
  const providers = tmdbFilm['watch/providers']?.results ?? {};
  const streamingRows: object[] = [];

  for (const country of PROVIDER_COUNTRIES) {
    const countryData = providers[country];
    if (!countryData) continue;

    const typeMap: Record<string, typeof countryData.flatrate> = {
      subscription: countryData.flatrate,
      rent: countryData.rent,
      buy: countryData.buy,
      free: countryData.free,
    };

    for (const [streamType, platforms] of Object.entries(typeMap)) {
      for (const p of (platforms ?? [])) {
        streamingRows.push({
          film_id: filmId,
          country_code: country,
          platform_id: p.provider_id,
          platform_name: p.provider_name,
          logo_path: p.logo_path,
          stream_type: streamType,
          verified_at: new Date().toISOString(),
        });
      }
    }
  }

  if (streamingRows.length > 0) {
    await supabase
      .from('streaming_availability')
      .upsert(streamingRows, { onConflict: 'film_id,country_code,platform_id,stream_type' });
  }

  return filmId;
}

async function fetchTmdbPage(endpoint: string, page: number): Promise<number[]> {
  const url = `${TMDB_BASE}/${endpoint}?language=en-US&page=${page}`;
  const res = await fetchWithRetry(url);
  const data = await res.json() as { results: Array<{ id: number }> };
  return data.results.map(r => r.id);
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const LIMIT = limitArg ? parseInt(limitArg.split('=')[1]!, 10) : 5000;

  console.log(`🎬 Flick TMDb Sync — target: ${LIMIT} films`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);

  const allIds = new Set<number>();

  // ── Priority seeds ──────────────────────────────────────────────────────────
  // These are the exact TMDB IDs used in the fine-tune onboarding screen
  // (apps/mobile/app/profile/fine-tune.tsx). They MUST be in the DB or the
  // fine-tune step silently skips saving ratings. Sync these unconditionally first.
  const FINE_TUNE_SEED_IDS = [
    118340, // Guardians of the Galaxy (2014)
    530385, // Midsommar (2019)
    264660, // Ex Machina (2015)
    597089, // Five Nights at Freddy's (2023)
    848538, // Argylle (2024)
    489,    // Good Will Hunting (1997)
    313369, // La La Land (2016)
    615656, // Meg 2: The Trench (2023)
  ];

  console.log('🌱 Syncing fine-tune seed films first...');
  let seedSucceeded = 0;
  for (const tmdbId of FINE_TUNE_SEED_IDS) {
    allIds.add(tmdbId); // pre-add so main loop skips duplicates
    const film = await fetchFilmDetails(tmdbId);
    if (film && !film.adult) {
      const id = await upsertFilm(film);
      if (id) seedSucceeded++;
    }
    await new Promise(r => setTimeout(r, 150));
  }
  console.log(`   ✅ Seeded ${seedSucceeded}/${FINE_TUNE_SEED_IDS.length} priority films\n`);

  // Fetch popular films (up to 50 pages = 1000 films)
  console.log('📡 Fetching popular films...');
  for (let page = 1; page <= 50 && allIds.size < LIMIT; page++) {
    const ids = await fetchTmdbPage('movie/popular', page);
    ids.forEach(id => allIds.add(id));
    process.stdout.write(`\r   Popular: ${allIds.size} IDs collected`);
    await new Promise(r => setTimeout(r, 250)); // rate limit respect
  }

  // Fetch top-rated films (up to 100 pages = 2000 films)
  console.log('\n📡 Fetching top-rated films...');
  for (let page = 1; page <= 100 && allIds.size < LIMIT; page++) {
    const ids = await fetchTmdbPage('movie/top_rated', page);
    ids.forEach(id => allIds.add(id));
    process.stdout.write(`\r   Top-rated: ${allIds.size} IDs collected`);
    await new Promise(r => setTimeout(r, 250));
  }

  // Fetch non-English films for diversity (PRD §1 — format agnostic)
  const diversityLanguages = ['ko', 'ja', 'hi', 'fr', 'es', 'de', 'tr', 'it', 'pt', 'zh'];
  console.log('\n📡 Fetching diverse cinema...');
  for (const lang of diversityLanguages) {
    if (allIds.size >= LIMIT) break;
    for (let page = 1; page <= 5 && allIds.size < LIMIT; page++) {
      const url = `${TMDB_BASE}/discover/movie?language=en-US&with_original_language=${lang}&sort_by=vote_count.desc&vote_count.gte=1000&page=${page}`;
      try {
        const res = await fetchWithRetry(url);
        const data = await res.json() as { results: Array<{ id: number }> };
        data.results.forEach(r => allIds.add(r.id));
        await new Promise(r => setTimeout(r, 250));
      } catch {
        // skip
      }
    }
  }

  const idArray = Array.from(allIds).slice(0, LIMIT);
  console.log(`\n✅ Collected ${idArray.length} unique film IDs. Starting detail fetch...\n`);

  let processed = 0;
  let succeeded = 0;
  let skipped = 0;

  for (const tmdbId of idArray) {
    const film = await fetchFilmDetails(tmdbId);
    if (!film || film.adult) { skipped++; continue; }

    const id = await upsertFilm(film);
    if (id) succeeded++;
    else skipped++;

    processed++;
    if (processed % 50 === 0) {
      process.stdout.write(`\r   Progress: ${processed}/${idArray.length} | ✅ ${succeeded} | ⏭️  ${skipped}`);
    }

    // Respect TMDb rate limit (40 req/s max — we stay well under)
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n\n🏁 Sync complete!`);
  console.log(`   ✅ Upserted: ${succeeded} films`);
  console.log(`   ⏭️  Skipped:  ${skipped} films`);
  console.log(`   📅 Finished: ${new Date().toISOString()}`);
}

main().catch(err => {
  console.error('💥 Sync failed:', err);
  process.exit(1);
});
