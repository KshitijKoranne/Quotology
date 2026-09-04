import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { catCount, labelFor, shorten } from '../../src/quotes';
import { C, F, T, pal } from '../../src/theme';
import { useStore } from '../../src/store';

export default function Library() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { saved, toggleSave, topics } = useStore();
  const collections = topics.slice(0, 6);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 30, gap: 20 }}>
      <View style={{ paddingHorizontal: 22, gap: 10 }}>
        <Text style={T.screenTitle}>Library</Text>
        <Text style={{ fontFamily: F.regular, fontSize: 14, color: 'rgba(32,30,29,0.6)' }}>
          {saved.length === 1 ? '1 quote saved' : `${saved.length} quotes saved`}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 22, gap: 2 }}>
        {collections.map((t, i) => {
          const c = pal(i);
          return (
            <Pressable key={t} onPress={() => router.push({ pathname: '/search', params: { tag: t } })}
              style={{ width: '49.4%', backgroundColor: c.bg, paddingVertical: 18, paddingHorizontal: 16, minHeight: 104, justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: F.extra, fontSize: 19, color: c.fg }}>{labelFor(t)}</Text>
              <Text style={{ fontFamily: F.regular, fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase', color: c.fg, opacity: 0.8 }}>
                {catCount(t)} quotes
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ paddingHorizontal: 22, fontFamily: F.regular, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: C.faint }}>Saved</Text>

      {saved.length === 0 ? (
        <View style={{ marginHorizontal: 22, borderWidth: 2, borderColor: C.ink, padding: 24, gap: 10 }}>
          <Text style={{ fontFamily: F.extra, fontSize: 22, lineHeight: 24 }}>No saved quotes yet</Text>
          <Text style={{ fontFamily: F.regular, fontSize: 14, color: 'rgba(32,30,29,0.6)' }}>
            Tap Save on any quote and it lands here.
          </Text>
          <Pressable onPress={() => router.push('/')} style={{ alignSelf: 'flex-start', marginTop: 6, backgroundColor: C.accent, paddingVertical: 12, paddingHorizontal: 16 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 12, letterSpacing: 0.96, textTransform: 'uppercase', color: '#fff' }}>Back to today</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ borderTopWidth: 2, borderTopColor: C.ink }}>
          {saved.map((item) => (
            <View key={item.id}
              style={{ flexDirection: 'row', gap: 12, paddingVertical: 16, paddingHorizontal: 22, borderBottomWidth: 1, borderBottomColor: C.ruleSoft }}>
              <Pressable style={{ flex: 1, gap: 5 }} onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}>
                <Text style={{ fontFamily: F.semi, fontSize: 16, lineHeight: 22 }}>“{shorten(item.content)}”</Text>
                <Text style={{ fontFamily: F.regular, fontSize: 12, letterSpacing: 0.72, textTransform: 'uppercase', color: 'rgba(32,30,29,0.5)' }}>{item.author}</Text>
              </Pressable>
              <Pressable onPress={() => toggleSave(item)} hitSlop={10}>
                <Text style={{ fontSize: 17, color: C.accent }}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
