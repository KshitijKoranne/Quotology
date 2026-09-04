// Design tokens — Modernist design system, Quotology direction 1b ("Poster").
// Source of truth: design/_ds/modernist-*/styles.css + QuotologyApp.dc.html (variant 2).

export const C = {
  ink: '#201e1d',
  paper: '#ffffff',
  bg: '#f3f2f2',
  surface: '#eae9e9',
  accent: '#e0574a',
  black: '#141312',
  rule: 'rgba(32,30,29,0.22)',
  ruleSoft: 'rgba(32,30,29,0.14)',
  muted: 'rgba(32,30,29,0.55)',
  faint: 'rgba(32,30,29,0.45)',
  ghost: 'rgba(32,30,29,0.08)',
};

// Card colours cycle by position in the returned set, so a refresh reshuffles them.
export const PAL = [
  { bg: '#45899f', fg: '#ffffff', tint: 'rgba(255,255,255,0.20)' },
  { bg: '#f2bd63', fg: '#201e1d', tint: 'rgba(32,30,29,0.12)' },
  { bg: '#e0574a', fg: '#ffffff', tint: 'rgba(255,255,255,0.22)' },
  { bg: '#9c3a2d', fg: '#ffffff', tint: 'rgba(255,255,255,0.18)' },
];
export const pal = (i: number) => PAL[((i % PAL.length) + PAL.length) % PAL.length];

// 1b is Modernist: zero radius everywhere except the floating tab bar.
export const R = { card: 0, sheet: 0, toast: 0, widget: 0, tab: 26, pill: 100 };

// Two families, one job each.
//   Display — Bricolage Grotesque. The wordmark, screen titles and the quote
//   itself: things you read as content, set large and tight.
//   Interface — Inter. Labels, rows, buttons, body copy: things you read as
//   interface, set small, where legibility beats character.
export const F = {
  /** The wordmark only. Playfair Display Bold Italic — cursive-leaning, so
   *  the name reads as a signature next to the flat modernist type. */
  brand: 'Playfair_700BoldItalic',

  display: 'Bricolage_800ExtraBold',
  displayBold: 'Bricolage_700Bold',
  displaySemi: 'Bricolage_600SemiBold',

  regular: 'Inter_400Regular',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',

  /** Kept so existing display call sites keep meaning "the display face". */
  extra: 'Bricolage_800ExtraBold',
};

export const SIZES = { Small: 22, Medium: 27, Large: 33 } as const;
export type SizeKey = keyof typeof SIZES;

export const S = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 };

// Android clips a Text whose lineHeight is under its fontSize, and adds its own
// font padding. Display type needs both switched off.
export const TIGHT = { includeFontPadding: false } as const;

export const T = {
  kicker: { fontFamily: F.semi, fontSize: 11, letterSpacing: 1.76, textTransform: 'uppercase' as const },
  eyebrow: { fontFamily: F.semi, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  screenTitle: { fontFamily: F.extra, fontSize: 38, lineHeight: 40, letterSpacing: -1.14, includeFontPadding: false },
  action: { fontFamily: F.semi, fontSize: 12, letterSpacing: 0.96, textTransform: 'uppercase' as const },
};
