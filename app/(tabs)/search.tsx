import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORIES, search, shorten, tagsText } from '../../src/quotes';
import { C, F, T, pal } from '../../src/theme';
import { useStore } from '../../src/store';

export default function Search() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cards, topics } = useStore();
  const params = useLocalSearchParams<{ tag?: string }>();
  const [q, setQ] = useState('');

  // A collection tile or a tag chip elsewhere can seed the query.
  React.useEffect(() => { if (params.tag) setQ(String(params.tag)); }, [params.tag]);

  const results = useMemo(() => (q.trim() ? search(q, 60) : cards.slice(0, 4)), [q, cards]);
  // The user's own categories first, then the rest.
  const chips = CATEGORIES.slice().sort(
    (a, b) => Number(topics.includes(b.id)) - Number(topics.includes(a.id))
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 22, paddingBottom: 30, gap: 18 }}>
      <Text style={T.screenTitle}>Search</Text>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Author, word or subject"
        placeholderTextColor={C.faint}
        autoCorrect={false}
        style={{ borderWidth: 2, borderColor: C.ink, fontFamily: F.regular, fontSize: 16, paddingVertical: 14, paddingHorizontal: 15, color: C.ink }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {chips.map((c) => {
          const on = q.toLowerCase() === c.id;
          return (
            <Pressable key={c.id} onPress={() => setQ(on ? '' : c.id)}
              style={{ borderWidth: 1, borderColor: 'rgba(32,30,29,0.3)', backgroundColor: on ? C.ink : C.paper, paddingVertical: 9, paddingHorizontal: 13 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: on ? '#fff' : C.ink }}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontFamily: F.regular, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: C.faint }}>
        {q.trim() ? `${results.length} results` : 'Suggested'}
      </Text>

      <View>
        {results.map((item, i) => (
          <Pressable key={item.id} onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
            style={{ flexDirection: 'row', gap: 12, paddingVertical: 16, borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,0.16)' }}>
            <View style={{ width: 6, backgroundColor: pal(i).bg }} />
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 16, lineHeight: 22 }}>“{shorten(item.content)}”</Text>
              <Text style={{ fontFamily: F.regular, fontSize: 12, letterSpacing: 0.72, textTransform: 'uppercase', color: 'rgba(32,30,29,0.5)' }}>
                {item.author} · {tagsText(item)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {q.trim() && results.length === 0 ? (
        <View style={{ paddingVertical: 26, borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,0.16)', gap: 8 }}>
          <Text style={{ fontFamily: F.extra, fontSize: 20 }}>Nothing for “{q}”</Text>
          <Text style={{ fontFamily: F.regular, fontSize: 14, color: 'rgba(32,30,29,0.6)' }}>
            Try an author, a tag, or a word from the quote.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
