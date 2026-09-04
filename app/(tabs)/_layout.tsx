import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R } from '../../src/theme';
import { IconHome, IconLibrary, IconSearch, IconSettings } from '../../src/icons';

const TABS = [
  { name: 'index', label: 'Home', Icon: IconHome },
  { name: 'search', label: 'Search', Icon: IconSearch },
  { name: 'library', label: 'Library', Icon: IconLibrary },
  { name: 'settings', label: 'Settings', Icon: IconSettings },
];

function Bar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{
      paddingHorizontal: Platform.OS === 'ios' ? 14 : 10,
      paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 2 : 10),
      backgroundColor: C.paper,
    }}>
      <View style={{ flexDirection: 'row', backgroundColor: C.black, borderRadius: R.tab, paddingTop: 12, paddingBottom: 10, paddingHorizontal: 8 }}>
        {state.routes.map((route: any, i: number) => {
          const def = TABS.find((t) => t.name === route.name);
          if (!def) return null;
          const focused = state.index === i;
          const color = focused ? '#ffffff' : 'rgba(255,255,255,0.45)';
          return (
            <Pressable
              key={route.key}
              onPress={() => !focused && navigation.navigate(route.name)}
              style={{ flex: 1, alignItems: 'center', gap: 5, paddingVertical: 2 }}>
              <def.Icon size={22} color={color} />
              <Text style={{ color, fontSize: 11, letterSpacing: 0.2, fontFamily: focused ? F.bold : F.regular }}>
                {def.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.paper } }} tabBar={(p) => <Bar {...p} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
