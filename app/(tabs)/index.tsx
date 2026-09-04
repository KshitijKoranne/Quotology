import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, T, TIGHT, pal } from '../../src/theme';
import { Quote, labelFor, sourceLine } from '../../src/quotes';
import { useStore } from '../../src/store';

const DATE = () =>
  new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

/** A ruled row. Collapsed it is ink on paper; expanded, colour floods it
 *  left to right and the type inverts — direction 1b. */
function Row({ q, index, expanded, onToggle }: {
  q: Quote; index: number; expanded: boolean; onToggle: () => void;
}) {
  const c = pal(index);
  const router = useRouter();
  const { isSaved, toggleSave, openSheet } = useStore();
  const a = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const [w, setW] = useState(0);

  useEffect(() => {
    Animated.timing(a, {
      toValue: expanded ? 1 : 0,
      duration: expanded ? 500 : 260,
      easing: Easing.bezier(0.2, 0.85, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const floodW = a.interpolate({ inputRange: [0, 1], outputRange: [0, w] });
  const fg = a.interpolate({ inputRange: [0, 0.45, 1], outputRange: [C.ink, C.ink, c.fg] });
  const saved = isSaved(q);

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{ borderBottomWidth: 1, borderBottomColor: C.rule, backgroundColor: C.paper, overflow: 'hidden' }}>
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: floodW, backgroundColor: c.bg }}
      />
      <Pressable onPress={() => { Haptics.selectionAsync(); onToggle(); }}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 18, paddingHorizontal: 22 }}>
        <Animated.Text style={{ fontFamily: F.extra, fontSize: 12, letterSpacing: 0.72, opacity: 0.55, width: 22, color: fg, marginTop: 6 }}>
          {String(index + 1).padStart(2, '0')}
        </Animated.Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Animated.Text style={{ fontFamily: F.extra, fontSize: 24, lineHeight: 26, ...TIGHT, letterSpacing: -0.48, textTransform: 'uppercase', color: fg }}>
            {q.author}
          </Animated.Text>
          <Animated.Text style={{ fontFamily: F.regular, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.6, color: fg }}>
            {sourceLine(q)}
          </Animated.Text>
        </View>
        <View style={{ width: 12, height: 12, backgroundColor: c.bg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', marginTop: 8 }} />
      </Pressable>

      {expanded ? (
        <Animated.View style={{ paddingLeft: 58, paddingRight: 22, paddingBottom: 24, gap: 16, opacity: a }}>
          <Animated.Text style={{ fontFamily: F.extra, fontSize: 27, lineHeight: 32, ...TIGHT, letterSpacing: -0.81, color: fg }}>
            {q.content}
          </Animated.Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Pressable onPress={() => router.push({ pathname: '/detail', params: { id: q.id } })}
              style={{ borderWidth: 2, borderColor: c.fg, paddingVertical: 10, paddingHorizontal: 14 }}>
              <Text style={[T.action, { color: c.fg }]}>Full poster</Text>
            </Pressable>
            <Pressable onPress={() => toggleSave(q)} style={{ paddingVertical: 10 }}>
              <Text style={[T.action, { color: c.fg }]}>{saved ? 'Saved' : 'Save'}</Text>
            </Pressable>
            <Pressable onPress={() => openSheet(q)} style={{ paddingVertical: 10, marginLeft: 'auto' }}>
              <Text style={[T.action, { color: c.fg }]}>Share</Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { cards, loading, live, refresh, saved, topics } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { setExpanded(cards[0]?.id ?? null); }, [cards]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 30 }}>
      <View style={{ paddingHorizontal: 22, paddingBottom: 26, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <View style={{ gap: 12, flex: 1 }}>
            <Text style={[T.kicker, { color: C.accent }]}>{DATE()}</Text>
            <Text style={{ fontFamily: F.brand, fontSize: 54, lineHeight: 58, letterSpacing: -1, ...TIGHT }}>Quotology</Text>
            <Text numberOfLines={2} style={{ fontFamily: F.regular, fontSize: 15, lineHeight: 21, color: 'rgba(32,30,29,0.66)', maxWidth: 240 }}>
              {cards.length} picked from {topics.map(labelFor).join(', ')}
            </Text>
          </View>
          <Text style={{ fontFamily: F.extra, fontSize: 150, lineHeight: 150, color: C.ghost, marginTop: -22, marginBottom: -40, ...TIGHT }}>”</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); refresh(); }}
            accessibilityRole="button" accessibilityLabel="Refresh today's set"
            style={{ borderWidth: 2, borderColor: C.ink, minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 }}>
            <Text style={[T.action, { color: C.ink, letterSpacing: 0.72 }]}>Refresh</Text>
          </Pressable>
          <Text style={{ fontFamily: F.regular, fontSize: 12, color: C.muted }}>
            {loading
              ? 'Looking for new quotes…'
              : live
                ? saved.length === 1 ? '1 quote saved' : `${saved.length} quotes saved`
                : 'No connection — showing your saved set'}
          </Text>
        </View>
      </View>

      <View style={{ borderTopWidth: 2, borderTopColor: C.ink }}>
        {cards.map((q, i) => (
          <Row key={q.id} q={q} index={i} expanded={expanded === q.id}
            onToggle={() => setExpanded(expanded === q.id ? null : q.id)} />
        ))}
      </View>
    </ScrollView>
  );
}
