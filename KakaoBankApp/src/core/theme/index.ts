/**
 * KakaoBank Design Tokens — matched to official home-screen screenshot.
 * Screens must import from here; do not hardcode hex / spacing in UI.
 */

export const colors = {
  /** Brand accent — KakaoBank signature yellow */
  accent: '#FEE500',
  /** Home canvas (soft off-white from screenshot) */
  background: '#F7F7F7',
  /** Elevated / promo surfaces */
  surface: '#FFFFFF',
  surfaceAccent: '#FFF8C5',

  text: {
    primary: '#191919',
    secondary: '#6B6B6B',
    tertiary: '#9A9A9A',
    inverse: '#FFFFFF',
    onAccent: '#191919',
    disabled: '#BDBDBD',
    link: '#1A73E8',
  },

  border: {
    default: '#E6E6E6',
    subtle: '#F0F0F0',
    strong: '#CCCCCC',
  },

  semantic: {
    success: '#00A873',
    warning: '#FF8A00',
    error: '#F04452',
    info: '#1A73E8',
    newBadge: '#FF5A5F',
  },

  skeleton: {
    base: '#EBEBEB',
    highlight: '#F7F7F7',
  },

  icon: {
    default: '#B0B0B0',
    active: '#191919',
    muted: '#C8C8C8',
  },

  overlay: 'rgba(25, 25, 25, 0.4)',
  transparent: 'transparent',

  /** Featured / list account cards — KakaoBank home screenshot */
  accountCard: {
    favorite: '#FEE500',
    coral: '#ED8F74',
    purple: '#8B8ECF',
    mint: '#D1E6D9',
    steel: '#5A84A2',
    taupe: '#D3CCB9',
    lilac: '#D9D4F0',
    peach: '#F0D5C4',
  },

  viewAllBadge: '#4A90E2',

  chip: {
    background: '#EFEFEF',
    text: '#555555',
    onLight: 'rgba(255,255,255,0.62)',
    onDark: 'rgba(255,255,255,0.24)',
  },

  divider: {
    onLight: 'rgba(25,25,25,0.08)',
    onDark: 'rgba(255,255,255,0.22)',
  },

  textOnDark: {
    secondary: 'rgba(255,255,255,0.88)',
  },

  notification: '#FF3B30',
  star: '#F5C542',
} as const;

/** Spacing scale (4pt grid) — screenshot margins ≈ 20 / gaps ≈ 12 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  /** Account / promo cards */
  card: 20,
  full: 9999,
} as const;

export const typography = {
  size: {
    micro: 11,
    caption: 12,
    body: 14,
    bodyLarge: 15,
    subtitle: 17,
    title: 20,
    headline: 22,
    display: 24,
    hero: 28,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.55,
  },
} as const;

/** Fixed component sizes from screenshot proportions */
export const size = {
  avatar: 36,
  bell: 28,
  badgeDot: 7,
  promoMinHeight: 92,
  moreHit: 28,
  actionChipMinWidth: 52,
  /** Bottom tab bar (KakaoBank home) — content only; add safe-area inset at runtime */
  tabIcon: 24,
  tabIconHit: 28,
  tabBarContentHeight: 56,
  tabBarMinBottomInset: 16,
} as const;

/** KakaoBank home is mostly flat — keep elevation subtle */
export const elevation = {
  none: {
    shadowColor: colors.transparent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#191919',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#191919',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#191919',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const pressable = {
  opacity: {
    pressed: 0.72,
    disabled: 0.4,
  },
} as const;

export const layout = {
  screenPaddingX: spacing.xl,
  cardGap: spacing.md,
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  size,
  elevation,
  pressable,
  layout,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Spacing = typeof spacing;

export default theme;
