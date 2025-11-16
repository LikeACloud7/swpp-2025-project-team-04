// app/_layout.tsx
import '@/global.css';
import { useUser } from '@/hooks/queries/useUserQueries';
import { QueryProvider } from '@/lib/QueryProvider';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
export { ErrorBoundary } from 'expo-router';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import * as Linking from 'expo-linking';
import { LogBox } from 'react-native';

// Reanimated warnings 무시
LogBox.ignoreLogs(['[Reanimated]']);

// Disable Reanimated strict mode
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('[Reanimated]')) {
      return;
    }
    originalWarn(...args);
  };
}

SplashScreen.preventAutoHideAsync();

async function setupPlayerOnce() {
  const isInitialized = await TrackPlayer.isServiceRunning();
  try {
    if (!isInitialized) {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [],
        compactCapabilities: [],
        android: {
          appKilledPlaybackBehavior:
            AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        notificationCapabilities: [],
      });
      console.log('TP: 설정 완료');
    }
  } catch (err) {
    console.error('TP: setup 실패', err);
  }
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
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('[Deep Link] Received URL:', url);

      // 탭하면 오디오페이지로 navigate
      if (url.includes('notification.click')) {
        try {
          const activeTrack = await TrackPlayer.getActiveTrack();
          if (activeTrack?.id) {
            router.push(`/audioPlayer/${activeTrack.id}`);
          }
        } catch (error) {
          console.error('Error getting active track:', error);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

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
        <Stack.Screen name="level-result" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="initial-survey" options={{ headerShown: false }} />
    </Stack>
  );
}
