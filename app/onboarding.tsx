import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryGrid from '../src/CategoryGrid';
import { F, TIGHT } from '../src/theme';
import { useStore } from '../src/store';

type Step = {
  title: string;
  body: string;
  bg: string;
  fg: string;
  picker?: true;
  /** The last step asks for the notification, at the moment intent is stated. */
  optIn?: true;
  cta: string;
};

const STEPS: Step[] = [
  {
    title: 'One quote,\nevery morning',
    body: 'A fresh set every morning, mixed from many sources — including the Gita and the Mahabharata, cited chapter and verse.',
    bg: '#e0574a',
    fg: '#fff',
    cta: 'Continue',
  },
  {
    title: 'What do you\nwant to read?',
    body: 'Your first set comes from these. You can change them at any time.',
    bg: '#45899f',
    fg: '#fff',
    picker: true,
    cta: 'Continue',
  },
  {
    title: 'Keep the ones\nthat land',
    body: 'Save a quote and it goes to your library, grouped into collections by subject.',
    bg: '#f2bd63',
    fg: '#201e1d',
    cta: 'Continue',
  },
  {
    title: 'One quote,\n8:00 each morning',
    body: 'A different quote every day, on your lock screen before you open anything.',
    bg: '#201e1d',
    fg: '#fff',
    optIn: true,
    cta: 'Turn on the 8:00 quote',
  },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const { setOnboarded, topics, setTopics, setNotify, say } = useStore();
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const s = STEPS[i];
  const last = i === STEPS.length - 1;

  const finish = () => {
    if (!replay) setOnboarded(true);
    router.replace('/');
  };

  const next = async () => {
    if (!last) return setI(i + 1);
    if (s.optIn) {
      setBusy(true);
      const ok = await setNotify(true);
      setBusy(false);
      if (!ok) say('You can turn it on later in Settings');
    }
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: s.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 14 }}>
        <Text style={{ flex: 1, fontFamily: F.brand, fontSize: 22, letterSpacing: -0.2, color: s.fg }}>
          Quotology
        </Text>
        <Pressable onPress={finish} hitSlop={10}>
          <Text style={{ fontFamily: F.semi, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: s.fg, opacity: 0.8 }}>
            Skip
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
          gap: 20,
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 26) + 8,
        }}>
        {s.picker ? null : (
          <Text style={{ fontFamily: F.extra, fontSize: 130, lineHeight: 130, marginBottom: -34, ...TIGHT, color: s.fg, opacity: 0.35 }}>
            {i + 1}
          </Text>
        )}

        <Text style={{ fontFamily: F.extra, fontSize: 44, lineHeight: 46, ...TIGHT, letterSpacing: -1.54, color: s.fg }}>
          {s.title}
        </Text>
        <Text style={{ fontFamily: F.regular, fontSize: 16, lineHeight: 23, color: s.fg, opacity: 0.85, maxWidth: 320 }}>
          {s.body}
        </Text>

        {s.picker ? <CategoryGrid value={topics} onChange={setTopics} fg={s.fg} /> : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
          {STEPS.map((_, k) => (
            <View key={k} style={{ width: k === i ? 26 : 10, height: 4, backgroundColor: s.fg, opacity: k === i ? 1 : 0.4 }} />
          ))}
          <Pressable
            disabled={busy}
            accessibilityRole="button"
            onPress={next}
            style={{ marginLeft: 'auto', borderWidth: 2, borderColor: s.fg, paddingVertical: 14, paddingHorizontal: 20, opacity: busy ? 0.5 : 1 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 13, letterSpacing: 1.04, textTransform: 'uppercase', color: s.fg }}>
              {s.cta}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
