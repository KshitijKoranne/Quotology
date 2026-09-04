import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from '../src/store';
import { ShareSheet, Toast } from '../src/ui';
import { C } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false,
  }),
});

function Root() {
  const { ready, onboarded } = useStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});
    if (!onboarded && segments[0] !== 'onboarding') router.replace('/onboarding');
  }, [ready]);

  // Tapping the 08:00 push must open that quote, not the feed.
  useEffect(() => {
    const open = (id?: string) => {
      if (id) router.push({ pathname: '/detail', params: { id } });
    };
    Notifications.getLastNotificationResponseAsync()
      .then((r) => open(r?.notification.request.content.data?.id as string))
      .catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener((r) =>
      open(r.notification.request.content.data?.id as string)
    );
    return () => sub.remove();
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: C.paper }} />;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.paper } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="detail" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="topics" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="attributions" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <Toast />
      <ShareSheet />
    </View>
  );
}

export default function Layout() {
  const [loaded] = useFonts({
    Bricolage_600SemiBold: require('../assets/fonts/Bricolage_600SemiBold.ttf'),
    Bricolage_700Bold: require('../assets/fonts/Bricolage_700Bold.ttf'),
    Bricolage_800ExtraBold: require('../assets/fonts/Bricolage_800ExtraBold.ttf'),
    Inter_400Regular: require('../assets/fonts/Inter_400Regular.ttf'),
    Inter_600SemiBold: require('../assets/fonts/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('../assets/fonts/Inter_700Bold.ttf'),
    Playfair_700BoldItalic: require('../assets/fonts/Playfair_700BoldItalic.ttf'),
  });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <StoreProvider>
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
