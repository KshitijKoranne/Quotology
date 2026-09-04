import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CATEGORIES } from './quotes';
import { C, F } from './theme';

/** The one category picker, used by the intro and by Settings.
 *  `fg` lets it sit on a coloured intro page as well as on paper. */
export default function CategoryGrid({
  value,
  onChange,
  fg = C.ink,
  min = 1,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  fg?: string;
  min?: number;
}) {
  const toggle = (id: string) => {
    const on = value.includes(id);
    if (on && value.length <= min) return;
    Haptics.selectionAsync();
    onChange(on ? value.filter((x) => x !== id) : value.concat(id));
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {CATEGORIES.map((c) => {
        const on = value.includes(c.id);
        return (
          <Pressable
            key={c.id}
            onPress={() => toggle(c.id)}
            style={{
              borderWidth: 2,
              borderColor: fg,
              backgroundColor: on ? fg : 'transparent',
              paddingVertical: 11,
              paddingHorizontal: 14,
            }}>
            <Text
              style={{
                fontFamily: F.semi,
                fontSize: 12,
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: on ? (fg === C.ink ? '#fff' : C.ink) : fg,
              }}>
              {c.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
