import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { Quote, SizeKey } from './types';
import { DEFAULT_TOPICS, dailySet, fetchSet, norm } from './quotes';

const KEY = 'quotology.v1';

type Persisted = {
  saved: Quote[];
  size: SizeKey;
  notify: boolean;
  onboarded: boolean;
  topics: string[];
};

const DEFAULTS: Persisted = {
  saved: [],
  size: 'Medium',
  notify: false,
  onboarded: false,
  topics: DEFAULT_TOPICS,
};

type Ctx = Persisted & {
  ready: boolean;
  cards: Quote[];
  loading: boolean;
  live: boolean;
  refresh: () => void;
  toggleSave: (q: Quote) => void;
  isSaved: (q: Quote) => boolean;
  setSize: (s: SizeKey) => void;
  /** Resolves false when the OS refused; the caller must not claim success. */
  setNotify: (b: boolean) => Promise<boolean>;
  setOnboarded: (b: boolean) => void;
  setTopics: (t: string[]) => void;
  toast: string;
  say: (m: string) => void;
  sheet: Quote | null;
  openSheet: (q: Quote | null) => void;
};

const Store = createContext<Ctx>(null as any);
export const useStore = () => useContext(Store);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [p, setP] = useState<Persisted>(DEFAULTS);
  const [ready, setReady] = useState(false);
  // Show the bundled set at once. The live fetch enriches it; it does not gate it.
  const [cards, setCards] = useState<Quote[]>(() => dailySet(8, DEFAULTS.topics));
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const [toast, setToast] = useState('');
  const [sheet, setSheet] = useState<Quote | null>(null);
  const tt = useRef<any>(null);

  // False until storage has been read successfully. While false we never
  // write, because writing over an unread blob is how a library disappears.
  const hydrated = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v) {
          const parsed = { ...DEFAULTS, ...JSON.parse(v) } as Persisted;
          // Ids became content-derived; collapse anything saved under the old
          // timestamp ids so one quote is one row.
          const seen = new Set<string>();
          parsed.saved = (parsed.saved || []).filter((q) => {
            const k = norm(q.content || '');
            if (!k || seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          setP(parsed);
        }
        hydrated.current = true;
      })
      .catch(() => {
        // Read failed. Keep defaults on screen but refuse to persist over it.
        hydrated.current = false;
        say('Could not open your library. Restart the app.');
      })
      .finally(() => setReady(true));
  }, []);

  // Persisting is a side effect, so it belongs in an effect — not inside a
  // state updater, which React may run more than once.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!hydrated.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(p)).catch(() => {});
  }, [p]);

  const write = (next: Partial<Persisted>) => setP((s) => ({ ...s, ...next }));

  // One in-flight load at a time; a later one wins.
  const run = useRef(0);
  const load = (topics = p.topics) => {
    const id = ++run.current;
    setLoading(true);
    // Whatever happens, the screen already holds a valid set.
    setCards(dailySet(8, topics));
    fetchSet(8, topics)
      .then(({ quotes, live }) => {
        if (id !== run.current) return;
        if (quotes.length) setCards(quotes);
        setLive(live);
        setLoading(false);
      })
      .catch(() => {
        if (id !== run.current) return;
        setLive(false);
        setLoading(false);
      });
  };

  // Reload when the saved topics arrive, and whenever they change.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => load(p.topics), 400); // debounce chip tapping
    return () => clearTimeout(t);
  }, [ready, p.topics.join(',')]);

  // Local notifications are one-shot, so the queue has to be topped up.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active' && p.notify) topUpDaily(p.topics).catch(() => {});
    });
    return () => sub.remove();
  }, [p.notify, p.topics.join(',')]);

  const say = (m: string) => {
    setToast(m);
    clearTimeout(tt.current);
    tt.current = setTimeout(() => setToast(''), 1600);
  };

  const savedKeys = useMemo(() => new Set(p.saved.map((q) => norm(q.content))), [p.saved]);

  const value: Ctx = useMemo(
    () => ({
      ...p,
      ready,
      cards,
      loading,
      live,
      refresh: () => load(),
      isSaved: (q) => savedKeys.has(norm(q.content)),
      toggleSave: (q) => {
        const k = norm(q.content);
        const on = savedKeys.has(k);
        write({ saved: on ? p.saved.filter((x) => norm(x.content) !== k) : [q, ...p.saved] });
        say(on ? 'Removed' : 'Saved to library');
      },
      setSize: (size) => write({ size }),
      setNotify: async (notify) => {
        if (!notify) {
          write({ notify: false });
          await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
          return false;
        }
        const ok = await topUpDaily(p.topics, true).catch(() => false);
        write({ notify: ok });
        return ok;
      },
      setOnboarded: (onboarded) => write({ onboarded }),
      setTopics: (topics) => write({ topics }),
      toast,
      say,
      sheet,
      openSheet: setSheet,
    }),
    [p, ready, cards, loading, live, toast, sheet, savedKeys]
  );

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

// ── daily notification, 08:00 local ─────────────────────────────────────────
// A repeating DAILY trigger carries one fixed payload, so it would deliver the
// same sentence every morning forever. Instead we queue a run of one-shot
// dates, each with its own quote, and refill the queue whenever the app opens.
const DAYS = 30;

export async function topUpDaily(topics: string[] = [], force = false): Promise<boolean> {
  // Refilling costs 30 scheduling calls, so only do it when the queue is
  // actually running down — or when the user just turned it on.
  if (!force) {
    const pending = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
    if (pending.length > 7) return true;
  }
  const { status } = await Notifications.getPermissionsAsync();
  let granted = status === 'granted';
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.status === 'granted';
  }
  if (!granted) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', {
      name: 'Daily quote',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  for (let d = 0; d < DAYS; d++) {
    const when = new Date(now);
    when.setDate(now.getDate() + d);
    when.setHours(8, 0, 0, 0);
    if (when <= now) continue;
    // Seeded by the date, so the push and that morning's set agree.
    const key = `${when.getFullYear()}-${when.getMonth() + 1}-${when.getDate()}`;
    const q = dailySet(1, topics, key)[0];
    if (!q) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: q.author, body: q.content, data: { id: q.id } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: 'daily' },
    });
  }
  return true;
}
