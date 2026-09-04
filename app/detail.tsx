import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ARCHIVE, Quote, sourceLine } from '../src/quotes';
import { C, F, R, SIZES, pal } from '../src/theme';
import { Poster } from '../src/ui';
import { IconBookmark, IconMore } from '../src/icons';
import { useStore } from '../src/store';

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards, saved, isSaved, toggleSave, openSheet, size } = useStore();

  // Resolved once. Deriving this from `saved` on every render meant that
  // un-saving a quote silently replaced the screen with a different one.
  const resolved = useRef<Quote[] | null>(null);
  const pool: Quote[] = useMemo(() => {
    if (resolved.current) return resolved.current;
    const inCards = cards.findIndex((q) => q.id === id);
    const next =
      inCards >= 0
        ? cards
        : (() => {
            const hit = saved.find((q) => q.id === id) || ARCHIVE.find((q) => q.id === id);
            return hit ? [hit] : cards;
          })();
    if (next.length) resolved.current = next;
    return next;
  }, [id, cards]);

  const start = Math.max(0, pool.findIndex((q) => q.id === id));
  const [i, setI] = useState(start);
  const q = pool[i] || pool[0];
  if (!q) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper, paddingTop: insets.top + 24, paddingHorizontal: 22, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={{ fontFamily: F.semi, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: C.muted }}>‹ Back</Text>
        </Pressable>
        <Text style={{ fontFamily: F.extra, fontSize: 24, lineHeight: 28 }}>That quote isn’t here any more</Text>
      </View>
    );
  }

  const c = pal(i);
  const on = isSaved(q);
  const step = (d: number) => setI((v) => (v + d + pool.length) % pool.length);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 14 }}>
        <Pressable onPress={() => router.back()} style={btn(c.tint)} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={{ color: c.fg, fontSize: 17 }}>←</Text>
        </Pressable>
        <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 11, letterSpacing: 1.76, textTransform: 'uppercase', color: c.fg, opacity: 0.75 }}>
          {pool.length > 1 ? `${i + 1} of ${pool.length}` : sourceLine(q)}
        </Text>
        <Pressable onPress={() => toggleSave(q)} style={btn(c.tint)} accessibilityRole="button" accessibilityLabel={on ? 'Saved. Remove from library' : 'Save quote'}>
          <IconBookmark size={18} color={c.fg} filled={on} />
        </Pressable>
        <Pressable onPress={() => openSheet(q)} style={btn(c.tint)} accessibilityRole="button" accessibilityLabel="Share and export">
          <IconMore size={18} color={c.fg} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Poster q={q} index={i} scale={1} boost={SIZES[size] / SIZES.Medium} />
      </ScrollView>

      {pool.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: 2, paddingHorizontal: 22, paddingBottom: Math.max(insets.bottom, 18) }}>
          <Pressable onPress={() => step(-1)} style={nav(c.tint)}>
            <Text style={{ fontFamily: F.semi, fontSize: 12, letterSpacing: 0.96, textTransform: 'uppercase', color: c.fg }}>Previous</Text>
          </Pressable>
          <Pressable onPress={() => step(1)} style={nav(c.tint)}>
            <Text style={{ fontFamily: F.semi, fontSize: 12, letterSpacing: 0.96, textTransform: 'uppercase', color: c.fg }}>Next quote</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ height: Math.max(insets.bottom, 18) }} />
      )}
    </View>
  );
}

const btn = (tint: string) => ({
  width: 48, height: 48, backgroundColor: tint, borderRadius: R.pill,
  alignItems: 'center' as const, justifyContent: 'center' as const,
});
const nav = (tint: string) => ({
  flex: 1, backgroundColor: tint, paddingVertical: 15, alignItems: 'center' as const, borderRadius: R.card,
});
