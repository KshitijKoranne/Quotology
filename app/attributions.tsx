import React from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CREDITS } from '../src/quotes';
import { C, F, T } from '../src/theme';

export default function Attributions() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 40, gap: 18 }}>
      <View style={{ paddingHorizontal: 22, gap: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back"
          style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text style={[T.action, { color: C.muted }]}>‹ Back</Text>
        </Pressable>
        <Text style={T.screenTitle}>Attributions</Text>
        <Text style={{ fontFamily: F.regular, fontSize: 15, lineHeight: 21, color: C.muted }}>
          Quotology is built on other people’s work. Every source it reads from, and every
          typeface it sets, is listed here.
        </Text>
      </View>

      <View style={{ borderTopWidth: 2, borderTopColor: C.ink }}>
        {CREDITS.map((c) => (
          <Pressable
            key={c.name}
            onPress={() => Linking.openURL(c.url).catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel={`${c.name}. ${c.detail}. Opens in your browser.`}
            style={{
              paddingVertical: 16, paddingHorizontal: 22, gap: 3, minHeight: 44,
              borderBottomWidth: 1, borderBottomColor: C.ruleSoft,
            }}>
            <Text style={{ fontFamily: F.semi, fontSize: 16, color: C.ink }}>{c.name}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: C.muted }}>
              {c.detail}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ paddingHorizontal: 22, fontFamily: F.regular, fontSize: 13, lineHeight: 19, color: C.muted }}>
        Quotes are short passages reproduced with their author named. If you hold rights in
        something here and want it removed, write to the support address in Settings and it
        will be taken out of the next release.
      </Text>
    </ScrollView>
  );
}
