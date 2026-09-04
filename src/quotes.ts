// Quote data layer.
//
// Two tiers, on purpose:
//   1. A bundled archive that ships in the binary, so search, categories and
//      the daily set work with no network and no rate limit.
//        · 2,611 general quotes (QuoteSlate dataset)
//        ·   209 Mahabharata maxims (Ganguli translation, public domain)
//   2. Six free keyless APIs for a live set. They are called in PARALLEL and
//      the results are interleaved round-robin, so a set on the home screen
//      is always a mix of sources, never one API's output.
//
// Nothing here is shown to the user as a URL or an endpoint name. The user
// sees categories and authors only.

import raw from '../assets/data/quotes.json';
import scripture from '../assets/data/scripture.json';

export type Quote = {
  id: string;
  content: string;
  author: string;
  tags: string[];
  origin: string;
  ref?: string;
};

type Row = { i: number; c: string; a: string; t: string[]; r?: string };

const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
/** Hashes the WHOLE text: two quotes that only share their first 60
 *  characters must still be two rows, or React sees a duplicate key. */
function fnv(s: string) {
  const k = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let h = 2166136261;
  for (let i = 0; i < k.length; i++) h = Math.imul(h ^ k.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

const general: Quote[] = (raw as Row[]).map((q) => ({
  id: 'q' + fnv(q.c),
  content: q.c,
  author: q.a,
  tags: q.t,
  origin: 'Archive',
}));

const sacred: Quote[] = (scripture as Row[]).map((q) => ({
  id: 'q' + fnv(q.c),
  content: q.c,
  author: q.a,
  tags: q.t,
  origin: 'Archive',
  ref: q.r,
}));

export const ARCHIVE: Quote[] = general.concat(sacred);

// ── categories ──────────────────────────────────────────────────────────────
// One display name maps to several archive tags. `live` is the tag name the
// tag-aware API understands; `special` marks a category with its own source.
export type Category = {
  id: string;
  label: string;
  tags: string[];
  live?: string;
};

export const CATEGORIES: Category[] = [
  { id: 'scripture', label: 'Scripture', tags: ['scripture', 'mahabharata', 'gita'], live: 'wisdom' },
  { id: 'wisdom', label: 'Wisdom', tags: ['wisdom', 'knowledge', 'self-reflection'], live: 'wisdom' },
  { id: 'motivation', label: 'Motivation', tags: ['motivation', 'inspiration'], live: 'motivational' },
  { id: 'life', label: 'Life', tags: ['life', 'purpose', 'change'], live: 'life' },
  { id: 'love', label: 'Love', tags: ['love', 'empathy'], live: 'love' },
  { id: 'happiness', label: 'Happiness', tags: ['happiness', 'gratitude', 'harmony'], live: 'happiness' },
  { id: 'success', label: 'Success', tags: ['success', 'growth', 'leadership'], live: 'success' },
  { id: 'resilience', label: 'Resilience', tags: ['resilience', 'perseverance', 'courage', 'fear'], live: 'perseverance' },
  { id: 'hope', label: 'Hope', tags: ['hope'], live: 'hope' },
  { id: 'friendship', label: 'Friendship', tags: ['friendship'], live: 'friendship' },
  { id: 'calm', label: 'Calm', tags: ['mindfulness', 'patience', 'peace', 'forgiveness'], live: 'peace' },
  { id: 'stoic', label: 'Stoic', tags: ['stoicism'], live: 'stoicism' },
];

export const DEFAULT_TOPICS = ['scripture', 'wisdom', 'motivation', 'calm'];

const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const category = (id: string) => CAT[id];
export const labelFor = (id: string) => CAT[id]?.label ?? id;

/** Every archive tag a set of chosen categories covers. */
function tagsOf(topics: string[]): Set<string> {
  const s = new Set<string>();
  topics.forEach((t) => CAT[t]?.tags.forEach((x) => s.add(x)));
  return s;
}

const inTopics = (q: Quote, want: Set<string>) =>
  want.size === 0 || q.tags.some((t) => want.has(t));

// ── tags ────────────────────────────────────────────────────────────────────
const counts: Record<string, number> = {};
ARCHIVE.forEach((q) => q.tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
export const ALL_TAGS = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
export const tagCount = (t: string) => counts[t] || 0;
// Counted once at load. Printed on the Library tiles, so it has to be true.
const CAT_COUNTS: Record<string, number> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, ARCHIVE.filter((q) => q.tags.some((t) => c.tags.includes(t))).length])
);
export const catCount = (id: string) => CAT_COUNTS[id] || 0;

const byAuthor: Record<string, string[]> = {};
ARCHIVE.forEach((q) => {
  if (!byAuthor[q.author]) byAuthor[q.author] = [];
  byAuthor[q.author].push(...q.tags);
});
// Most APIs give no tags, so borrow the author's dominant archive tag.
function guessTags(author: string, content: string, given?: string[]): string[] {
  const known = (given || []).filter((t) => counts[t]);
  if (known.length) return known.slice(0, 3);
  const own = byAuthor[author];
  if (own && own.length) {
    const c: Record<string, number> = {};
    own.forEach((t) => (c[t] = (c[t] || 0) + 1));
    return Object.keys(c).sort((a, b) => c[b] - c[a]).slice(0, 2);
  }
  const low = content.toLowerCase();
  const hit = ALL_TAGS.find((t) => low.includes(t));
  return hit ? [hit] : ['wisdom'];
}

// ── deterministic daily shuffle ─────────────────────────────────────────────
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

/** Archive picks inside the chosen categories. Same set all day on every
 *  device when the default seed is used — a shared "today". */
export function dailySet(n = 8, topics: string[] = [], seed = dayKey()): Quote[] {
  const want = tagsOf(topics);
  const pool = ARCHIVE.filter((q) => inTopics(q, want));
  const src = pool.length >= n ? pool : ARCHIVE;
  const r = rng(seed);
  const out: Quote[] = [];
  const used = new Set<number>();
  while (out.length < n && used.size < src.length) {
    const i = Math.floor(r() * src.length);
    if (used.has(i)) continue;
    used.add(i);
    out.push(src[i]);
  }
  return out;
}

export function randomSet(n = 8, topics: string[] = []): Quote[] {
  return dailySet(n, topics, String(Date.now()) + Math.random());
}

/** Every archive quote in one category, newest shuffle first. */
export function byCategory(id: string, n = 60): Quote[] {
  const want = tagsOf([id]);
  const pool = ARCHIVE.filter((q) => inTopics(q, want));
  const r = rng(String(Date.now()));
  return pool.sort(() => r() - 0.5).slice(0, n);
}

// ── live sources ────────────────────────────────────────────────────────────
async function get(url: string, ms = 6000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

const clean = (s: string) => String(s).replace(/\s+/g, ' ').trim();

export const norm = normKey;
/** Stable across fetches, across sessions, and across sources. */
export const quoteId = (content: string) => 'q' + fnv(content);

const mk = (content: string, author: string, tags: string[], origin: string, ref?: string): Quote =>
  ({ id: quoteId(content), content, author, tags, origin, ref });

type Src = (topics: string[]) => Promise<Quote[]>;

const zenQuotes: Src = async () => {
  const j = await get('https://zenquotes.io/api/quotes');
  return (j as any[])
    .filter((x) => x && x.q && x.a && x.a !== 'zenquotes.io')
    .slice(0, 12)
    .map((x) => mk(clean(x.q), clean(x.a), guessTags(clean(x.a), x.q), 'Live'));
};

// The only source that answers by subject, so it carries the categories.
const quotesHub: Src = async (topics) => {
  const asked = (topics.length ? topics : ['wisdom']).filter((t) => CAT[t]?.live).slice(0, 4);
  const rows = await Promise.all(
    asked.map(async (id) => {
      const q = CAT[id].live as string;
      const x: any = await get(
        `https://thequoteshub.com/api/random-quote?tags=${encodeURIComponent(q)}`
      ).catch(() => null);
      if (!x || !x.text || !x.author) return null;
      // It answered for this category, so tag it with that category's own
      // tags — otherwise the category filter would throw its own answer away.
      return mk(clean(x.text), clean(x.author), CAT[id].tags.slice(0, 2), 'Live');
    })
  );
  return rows.filter(Boolean) as Quote[];
};

const dummyJson: Src = async () => {
  const j = await get('https://dummyjson.com/quotes/random/6');
  const rows: any[] = Array.isArray(j) ? j : (j as any).quotes || [];
  return rows.map((x) => mk(clean(x.quote), clean(x.author), guessTags(clean(x.author), x.quote), 'Live'));
};

const quotable: Src = async () => {
  const j: any = await get('https://api.quotable.kurokeita.dev/api/quotes/random');
  const q = j.quote || j;
  if (!q || !q.content) return [];
  const author = clean(q.author?.name || q.author || 'Unknown');
  const tags = (q.tags || []).map((t: any) => String(t.name || t).toLowerCase());
  return [mk(clean(q.content), author, guessTags(author, q.content, tags), 'Live')];
};

const stoic: Src = async () => {
  const j: any = await get('https://stoic.tekloon.net/stoic-quote');
  const d = j.data || j;
  if (!d || !d.quote) return [];
  return [mk(clean(d.quote), clean(d.author), ['stoicism', 'wisdom'], 'Live')];
};

// Bhagavad Gita, verse by verse. Public static API, English translation.
const GITA_VERSES = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];
const gita: Src = async () => {
  const out: Quote[] = [];
  await Promise.all(
    [0, 1, 2].map(async () => {
      const ch = 2 + Math.floor(Math.random() * 17); // chapters 2-18; 1 is narrative
      const vs = 1 + Math.floor(Math.random() * GITA_VERSES[ch - 1]);
      try {
        const j: any = await get(`https://vedicscriptures.github.io/slok/${ch}/${vs}`);
        const en = j?.purohit?.et || j?.siva?.et || j?.gambir?.et || j?.adi?.et;
        if (!en) return;
        const text = clean(en).replace(/^\d+\.\d+\.?\s*/, '');
        if (text.length < 45 || text.length > 300) return;
        out.push(mk(text, 'Bhagavad Gita', ['gita', 'scripture', 'wisdom'], 'Live',
          `Chapter ${ch}, Verse ${vs}`));
      } catch {
        // one missing verse is not a failure
      }
    })
  );
  return out;
};

const SOURCES: Src[] = [quotesHub, zenQuotes, gita, dummyJson, stoic, quotable];

/** Round-robin, so the set never comes from one source. */
function interleave(groups: Quote[][], n: number): Quote[] {
  const out: Quote[] = [];
  const seen = new Set<string>();
  for (let i = 0; out.length < n; i++) {
    let any = false;
    for (const g of groups) {
      if (i >= g.length) continue;
      any = true;
      const q = g[i];
      const k = norm(q.content);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(q);
      if (out.length >= n) break;
    }
    if (!any) break;
  }
  return out;
}

/**
 * A fresh set mixed from every source that answered, inside the chosen
 * categories, topped up from the archive so the count is always met.
 */
export async function fetchSet(
  n = 8,
  topics: string[] = []
): Promise<{ quotes: Quote[]; live: boolean }> {
  const want = tagsOf(topics);
  const settled = await Promise.allSettled(SOURCES.map((f) => f(topics)));
  const groups = settled
    .map((r) => (r.status === 'fulfilled' ? r.value : []))
    .map((g) => {
      // Untagged sources still have to respect the categories; a source that
      // answered by subject already does.
      const kept = g.filter((q) => inTopics(q, want));
      return kept.length ? kept : [];
    })
    .filter((g) => g.length);

  const liveCount = groups.reduce((a, g) => a + g.length, 0);
  // The archive is one more group in the round-robin, not a fallback that
  // takes over — that is what keeps a set mixed even on a slow network.
  const filler = randomSet(n, topics);
  const quotes = interleave(groups.concat([filler]), n);
  return { quotes, live: liveCount > 0 };
}

// ── search ──────────────────────────────────────────────────────────────────
export function search(q: string, limit = 60): Quote[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  // A collection tile passes a category id; widen it to that category's tags.
  if (CAT[s]) {
    const want = tagsOf([s]);
    return ARCHIVE.filter((x) => x.tags.some((t) => want.has(t))).slice(0, limit);
  }
  const starts: Quote[] = [];
  const rest: Quote[] = [];
  for (const x of ARCHIVE) {
    const a = x.author.toLowerCase();
    if (a.startsWith(s) || x.tags.some((t) => t === s)) starts.push(x);
    else if (a.includes(s) || x.content.toLowerCase().includes(s)) rest.push(x);
    if (starts.length >= limit) break;
  }
  return starts.concat(rest).slice(0, limit);
}

// ── view helpers ────────────────────────────────────────────────────────────
export const shorten = (s: string, n = 96) => (s.length > n ? s.slice(0, n - 3) + '…' : s);
export const tagsText = (q: Quote) => q.tags.join(' · ');
/** The design's "Book · War As I Knew It" slot. A scripture quote has a real
 *  reference; everything else shows its subject. */
export const sourceLine = (q: Quote) =>
  q.ref ? q.ref : (q.tags[0] || 'Quote');
