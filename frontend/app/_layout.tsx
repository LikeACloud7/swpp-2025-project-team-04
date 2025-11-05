// app/_layout.tsx
import '@/global.css';
import { useUser } from '@/hooks/queries/useUserQueries';
import { QueryProvider } from '@/lib/QueryProvider';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
export { ErrorBoundary } from 'expo-router';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer, { Capability } from 'react-native-track-player';

SplashScreen.preventAutoHideAsync();

async function setupPlayerOnce() {
  console.log('[TP] setupPlayerOnce');
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    // Service에서 처리하는 모든 기능 명시
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.SeekTo,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    // 알림 센터(Compact)에 표시할 버튼 (iOS/Android 공통)
    compactCapabilities: [Capability.Play, Capability.Pause],
  });
}

export default function RootLayout() {
  useEffect(() => {
    // 앱 시작 시 1회만 초기화 시도
    setupPlayerOnce();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <RootNavigation />
      </QueryProvider>
    </SafeAreaProvider>
  );
}

function RootNavigation() {
  const { data: user, isLoading: isAuthLoading } = useUser();

  useEffect(() => {
    let didHide = false;
    if (!isAuthLoading) {
      const start = Date.now();
      const hide = async () => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 1000 - elapsed);
        setTimeout(async () => {
          if (!didHide) {
            await SplashScreen.hideAsync();
            didHide = true;
          }
        }, remaining);
      };
      hide();
    }
    return () => {
      didHide = true;
    };
  }, [isAuthLoading]);

  if (isAuthLoading) return null;

  return (
    <Stack>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen
          name="audioPlayer/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="feedback" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="initial-survey" options={{ headerShown: false }} />
    </Stack>
  );
}
