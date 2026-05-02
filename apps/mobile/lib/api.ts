/**
 * Typed API client for the Flick backend.
 * All calls automatically attach the Supabase JWT from the active session.
 */
import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://flick-ysai.onrender.com';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Film endpoints ──────────────────────────────────────────

export const filmsApi = {
  search: (q: string, filters?: {
    genre_ids?: string;
    year_min?: number;
    year_max?: number;
    language?: string;
    min_rating?: number;
  }) => {
    const query: Record<string, string> = { q };
    if (filters?.genre_ids) query.genre_ids = filters.genre_ids;
    if (filters?.year_min) query.year_min = String(filters.year_min);
    if (filters?.year_max) query.year_max = String(filters.year_max);
    if (filters?.language) query.language = filters.language;
    if (filters?.min_rating) query.min_rating = String(filters.min_rating);

    const qs = Object.entries(query)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    return request<{ data: any[]; error: null }>(`/api/films/search?${qs}`);
  },

  getById: (id: string | number) =>
    request<{ data: any; error: null }>(`/api/films/${id}`),

  getStreaming: (id: string | number, country = 'IN') =>
    request<{ data: any[]; error: null }>(`/api/films/${id}/streaming?country=${country}`),

  getSimilar: (id: string | number) =>
    request<{ data: any[]; error: null }>(`/api/films/${id}/similar`),
};

// ── Recommendation endpoints ────────────────────────────────

export const recommendationsApi = {
  getDailyPick: () =>
    request<{ data: any; error: null }>('/api/recommendations/daily-pick'),

  dismiss: (filmId: string | number, reason: string) =>
    request<{ data: any; error: null }>(`/api/recommendations/daily-pick/${filmId}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// ── Library endpoints ───────────────────────────────────────

export const libraryApi = {
  importLetterboxd: async (csvUri: string, fileName: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const formData = new FormData();
    formData.append('file', {
      uri: csvUri,
      name: fileName,
      type: 'text/csv',
    } as any);

    const res = await fetch(`${BASE_URL}/api/library/import/letterboxd`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.message ?? `Import error ${res.status}`);
    }
    return res.json();
  },

  getImportProgress: (jobId: string) =>
    request<{ data: any; error: null }>(`/api/library/import/${jobId}/status`),

  confirmImport: (jobId: string, confirmedIds: string[]) =>
    request<{ data: any; error: null }>(`/api/library/import/${jobId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ confirmed_ids: confirmedIds }),
    }),
};
