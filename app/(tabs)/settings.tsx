import React from 'react';
import { Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { labelFor } from '../../src/quotes';
import { C, F, SIZES, SizeKey, T } from '../../src/theme';
import { useStore } from '../../src/store';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notify, setNotify, size, setSize, topics, say } = useStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 30, gap: 18 }}>
      <Text style={[T.screenTitle, { paddingHorizontal: 22 }]}>Settings</Text>

      <View style={{ borderTopWidth: 2, borderTopColor: C.ink }}>
        <Pressable style={row} onPress={() => router.push('/topics')}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={label}>Your topics</Text>
            <Text style={sub} numberOfLines={1}>
              {topics.map(labelFor).join(', ')}
            </Text>
          </View>
          <Text style={chev}>›</Text>
        </Pressable>

        <View style={row}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={label}>Daily quote</Text>
            <Text style={sub}>Push at 08:00, local time</Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="Daily quote"
            accessibilityState={{ checked: notify }}
            onPress={async () => {
              const next = !notify;
              const ok = await setNotify(next);
              if (next && !ok) {
                say('Notifications are blocked for Quotology');
                Linking.openSettings().catch(() => {});
                return;
              }
              say(next ? 'Daily quote on' : 'Daily quote off');
            }}
            style={{
              width: 52, height: 30, borderWidth: 2, borderColor: C.ink, padding: 2,
              backgroundColor: notify ? C.accent : C.paper,
              flexDirection: 'row', alignItems: 'center',
              justifyContent: notify ? 'flex-end' : 'flex-start',
            }}>
            <View style={{ width: 22, height: 22, backgroundColor: notify ? '#fff' : C.ink }} />
          </Pressable>
        </View>

        <View style={[row, { flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
          <Text style={label}>Quote size</Text>
          <View style={{ flexDirection: 'row', borderWidth: 2, borderColor: C.ink }}>
            {(Object.keys(SIZES) as SizeKey[]).map((k, i) => {
              const on = size === k;
              return (
                <Pressable key={k} onPress={() => setSize(k)}
                  style={{ flex: 1, backgroundColor: on ? C.ink : C.paper, paddingVertical: 11, alignItems: 'center', borderRightWidth: i < 2 ? 1 : 0, borderRightColor: 'rgba(32,30,29,0.2)' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 12, letterSpacing: 0.96, textTransform: 'uppercase', color: on ? '#fff' : C.ink }}>{k}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={row} onPress={() => router.push('/onboarding?replay=1')}>
          <Text style={[label, { flex: 1 }]}>Replay intro</Text>
          <Text style={chev}>›</Text>
        </Pressable>

        <View style={{ paddingVertical: 17, paddingHorizontal: 22 }}>
          <Text style={{ fontFamily: F.regular, fontSize: 13, color: C.faint }}>
            Quotology 1.0 · {Platform.OS === 'ios' ? 'iOS' : 'Android'} · KJR Labs
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const row = {
  flexDirection: 'row' as const, alignItems: 'center' as const, gap: 14,
  paddingVertical: 17, paddingHorizontal: 22,
  borderBottomWidth: 1, borderBottomColor: C.ruleSoft,
};
const label = { fontFamily: F.semi, fontSize: 16, color: C.ink };
const sub = { fontFamily: F.regular, fontSize: 13, color: C.muted };
const chev = { fontSize: 16, color: 'rgba(32,30,29,0.35)' };
