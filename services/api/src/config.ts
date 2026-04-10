import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // TMDb
  TMDB_API_TOKEN: z.string().min(1),
  TMDB_API_KEY: z.string().min(1),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // Gemini
  GEMINI_API_KEY: z.string().min(1),

  // Resend
  RESEND_API_KEY: z.string().min(1),

  // Sentry
  SENTRY_DSN_API: z.string().url(),

  // PostHog
  POSTHOG_API_KEY: z.string().min(1),
  POSTHOG_HOST: z.string().url(),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,exp://localhost:8081'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();
export type Env = typeof env;
