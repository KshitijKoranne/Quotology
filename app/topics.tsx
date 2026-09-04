import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryGrid from '../src/CategoryGrid';
import { C, F, T } from '../src/theme';
import { useStore } from '../src/store';

export default function Topics() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { topics, setTopics } = useStore();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 22, paddingBottom: 40, gap: 18 }}>
      <Pressable onPress={() => router.back()} hitSlop={10}>
        <Text style={[T.action, { color: C.faint }]}>‹ Back</Text>
      </Pressable>

      <Text style={T.screenTitle}>Your topics</Text>
      <Text style={{ fontFamily: F.regular, fontSize: 15, lineHeight: 21, color: C.muted }}>
        Every set you get, and every refresh, stays inside these. Pick as many as you like.
      </Text>

      <CategoryGrid value={topics} onChange={setTopics} />

      <Text style={{ fontFamily: F.regular, fontSize: 13, color: C.faint }}>
        {topics.length} selected
      </Text>
    </ScrollView>
  );
}
