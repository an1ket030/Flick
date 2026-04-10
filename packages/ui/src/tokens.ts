// ============================================================
// Flick Design System Tokens
// Implements the brand identity from PRD §4
// ============================================================

// ── Colour Palette ──────────────────────────────────────────
export const Colors = {
  // Brand Primary — cinematic gold
  brand: {
    primary:    '#F5C518',  // IMDb gold — primary CTA
    primaryDim: '#C9A010',  // pressed / hover state
    accent:     '#E8A020',  // warm amber — secondary highlight
  },

  // Background Scale — deep cinema dark
  background: {
    base:    '#0A0A0A',  // screen background
    surface: '#141414',  // cards, sheets
    elevated:'#1E1E1E',  // modals, dropdowns
    overlay: '#2A2A2A',  // borders, subtle dividers
  },

  // Text Scale
  text: {
    primary:   '#FFFFFF',   // headings, body on dark
    secondary: '#A8A8A8',   // meta, captions
    tertiary:  '#606060',   // placeholders, disabled
    inverse:   '#0A0A0A',   // text on light/gold backgrounds
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
    love: '#F5C518',
    hate: '#3A1A1A',  // dark red tint
    neutral: '#2A2A2A',
  },

  transparent: 'transparent',
} as const;

// ── Typography ───────────────────────────────────────────────
export const Typography = {
  // Font families (loaded via expo-google-fonts)
  family: {
    heading: 'PlayfairDisplay_700Bold',
    headingRegular: 'PlayfairDisplay_400Regular',
    body:    'Inter_400Regular',
    bodySemibold: 'Inter_600SemiBold',
    bodyBold: 'Inter_700Bold',
    mono:    'SpaceMono_400Regular',
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
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 20,
  full: 9999,
} as const;

// ── Shadows ──────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
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
