// ============================================================
// Flick Design System Tokens — V2 "Vibrant Slate"
// PRD §4 — Dark mode only at launch
// ============================================================

// ── Colour Palette ──────────────────────────────────────────
export const Colors = {
  // Brand Primary — Vibrant Orange
  brand: {
    primary:    '#FF6B2C',  // Vibrant Orange — primary CTA, active states
    primaryDim: '#D95520',  // pressed / hover state
    accent:     '#FF8C55',  // lighter orange — secondary highlight
  },

  // Background Scale — deep cinema black
  background: {
    base:    '#121212',  // screen background
    surface: '#1A1A1A',  // cards, sheets
    elevated:'#242424',  // modals, dropdowns
    overlay: '#2E2E2E',  // borders, subtle dividers
  },

  // Text Scale
  text: {
    primary:   '#F0F0F0',   // headings, body on dark
    secondary: '#A0A0A0',   // meta, captions
    tertiary:  '#606060',   // placeholders, disabled
    inverse:   '#121212',   // text on orange/light backgrounds
  },

  // Status Colours
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error:   '#EF4444',
    info:    '#3B82F6',
  },

  // Rating Colours (used in rating badge)
  rating: {
    excellent: '#22C55E',  // ≥ 8.0
    good:      '#84CC16',  // 6.5–7.9
    average:   '#F59E0B',  // 5.0–6.4
    poor:      '#EF4444',  // < 5.0
  },

  // Library Status Colours
  library: {
    planned:  '#3B82F6',  // blue
    watching: '#8B5CF6',  // purple
    watched:  '#22C55E',  // green
    paused:   '#F59E0B',  // amber
    dropped:  '#6B7280',  // grey
  },

  // Genre Chip — love/hate
  genre: {
    love:    '#FF6B2C',  // vibrant orange
    hate:    '#3A1A1A',  // dark red tint
    neutral: '#2E2E2E',
  },

  transparent: 'transparent',
} as const;

// ── Typography ───────────────────────────────────────────────
export const Typography = {
  // Font families loaded via expo-google-fonts
  // Headings: Plus Jakarta Sans (geometric, modern)
  // Body/Labels: Be Vietnam Pro (clean, readable)
  family: {
    heading:       'PlusJakartaSans_700Bold',
    headingSemi:   'PlusJakartaSans_600SemiBold',
    headingMedium: 'PlusJakartaSans_500Medium',
    headingRegular:'PlusJakartaSans_400Regular',
    body:          'BeVietnamPro_400Regular',
    bodyMedium:    'BeVietnamPro_500Medium',
    bodySemibold:  'BeVietnamPro_600SemiBold',
    bodyBold:      'BeVietnamPro_700Bold',
  },

  // Font sizes (sp — scales with system)
  size: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
    '5xl': 48,
  },

  // Line heights
  lineHeight: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.8,
  },

  // Letter spacing
  tracking: {
    tight:  -0.5,
    normal: 0,
    wide:   0.5,
    wider:  1.5,
    widest: 2.5,
  },
} as const;

// ── Spacing ──────────────────────────────────────────────────
export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

// ── Border Radius ────────────────────────────────────────────
export const Radius = {
  none: 0,
  sm:   6,
  md:   10,
  lg:   16,
  xl:   20,
  '2xl': 28,
  full: 9999,
} as const;

// ── Shadows ──────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 14,
  },
  orange: {
    shadowColor: '#FF6B2C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// ── Poster Aspect Ratio ──────────────────────────────────────
export const PosterRatio = 2 / 3; // width / height = 0.667

// ── TMDb Image Base URL ──────────────────────────────────────
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function posterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function profileUrl(path: string | null, size: 'w185' | 'h632' | 'original' = 'w185'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
