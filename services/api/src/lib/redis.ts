import { Redis } from '@upstash/redis';
import { env } from '../config.js';

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache helpers with typed keys
export const CacheKeys = {
  dailyPick: (userId: string, date: string) => `daily_pick:${userId}:${date}`,
  moodPick: (userId: string, mood: string, filters: string) => `mood:${userId}:${mood}:${filters}`,
  filmSearch: (query: string, filters: string) => `search:${query}:${filters}`,
  filmDetail: (filmId: string) => `film:${filmId}`,
  streamingAvail: (filmId: string, country: string) => `streaming:${filmId}:${country}`,
  libraryStats: (userId: string) => `stats:${userId}`,
  predictions: (userId: string) => `predictions:${userId}`,
} as const;

export const CacheTTL = {
  dailyPick: 86400,       // 24 hours
  moodPick: 14400,        // 4 hours
  filmSearch: 3600,        // 1 hour
  filmDetail: 3600,        // 1 hour
  streamingAvail: 86400,  // 24 hours
  libraryStats: 300,       // 5 minutes
  predictions: 3600,       // 1 hour
} as const;

export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(fresh));
  return fresh;
}
