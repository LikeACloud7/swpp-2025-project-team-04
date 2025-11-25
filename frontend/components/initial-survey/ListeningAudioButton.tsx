import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View, Alert } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { getAudioUrl } from '@/api/initialSurvey';
import { getAccessToken } from '@/utils/tokenManager';
import * as FileSystem from 'expo-file-system/legacy';

type ListeningAudioButtonProps = {
  level: string;
  questionNumber: number;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function ListeningAudioButton({
  level,
  questionNumber,
}: ListeningAudioButtonProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadedUri, setDownloadedUri] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // expo-audio player
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  // 백엔드 API에서 오디오 파일 URL 생성
  const audioUrl = useMemo(() => {
    if (!level) return '';
    return getAudioUrl(level, questionNumber);
  }, [level, questionNumber]);

  useEffect(() => {
    setDownloadedUri(null);
    setCurrentTime(0);
    setIsLoading(false);

    if (player) {
      player.pause();
      player.seekTo(0);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [level, questionNumber, player]);

  // 현재 시간 update
  useEffect(() => {
    if (!status?.playing) return;

    const interval = setInterval(() => {
      const time = status?.currentTime || 0;
      const duration = status?.duration || 0;

      if (duration > 0 && time >= duration - 0.5) {
        setCurrentTime(duration);
      } else {
        setCurrentTime(time);
      }
    }, 100); // 100ms update

    return () => clearInterval(interval);
  }, [status?.playing, status]);

  const handlePlayPause = useCallback(async () => {
    if (!player) return;

    try {
      if (status?.playing) {
        player.pause();
      } else {
        // Set loading immediately at the start to prevent glitching
        if (!downloadedUri) {
          setIsLoading(true);
        }

        if (downloadedUri) {
          player.play();
          return;
        }

        if (!audioUrl) return;

        const accessToken = getAccessToken();
        if (!accessToken) {
          throw new Error('No access token available');
        }

        const fileName = `audio_${level}_${questionNumber}.wav`;
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

        const downloadResult = await FileSystem.downloadAsync(
          audioUrl,
          fileUri,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (downloadResult.status !== 200) {
          throw new Error(`Failed to download audio`);
        }

        player.replace({ uri: downloadResult.uri });
        player.play();

        timeoutRef.current = setTimeout(() => {
          setDownloadedUri(downloadResult.uri);
          setIsLoading(false);
          timeoutRef.current = null;
        }, 50);
      }
    } catch (error) {
      console.error('Failed to load audio:', error);
      setIsLoading(false);
      Alert.alert('오디오 재생 오류', '오디오 파일을 불러올 수 없습니다.');
    }
  }, [player, status?.playing, audioUrl, downloadedUri, level, questionNumber]);

  const handleRestart = useCallback(() => {
    if (!player || !downloadedUri) return;

    player.seekTo(0);
    setCurrentTime(0);
    player.play();
  }, [player, downloadedUri]);

  const duration = status?.duration || 0;
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const hasFinished =
    duration > 0 &&
    !status?.playing &&
    downloadedUri !== null &&
    currentTime >= duration * 0.95;

  return (
    <View className="items-center mt-8 mb-4 w-full px-4">
      <View className="w-full max-w-[320px] bg-white rounded-3xl p-6 shadow-lg border border-sky-100">
        <Text className="text-sky-900 text-[16px] font-bold text-center mb-4">
          오디오 {questionNumber}
        </Text>

        {/* Play/Pause Button(s) */}
        {status?.playing || isLoading ? (
          <Pressable
            onPress={handlePlayPause}
            className="py-4 rounded-xl bg-sky-500 mb-4 shadow-md"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            android_ripple={{ color: '#0284C7' }}
            disabled={isLoading}
          >
            <Text className="text-white text-[18px] font-bold text-center">
              {'❚❚ 일시정지'}
              {/* {isLoading ? '로딩 중...' : '❚❚ 일시정지'} */}
            </Text>
          </Pressable>
        ) : downloadedUri ? (
          hasFinished ? (
            <Pressable
              onPress={handleRestart}
              className="py-4 rounded-xl bg-sky-500 mb-4 shadow-md"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              android_ripple={{ color: '#0284C7' }}
            >
              <Text className="text-white text-[18px] font-bold text-center">
                ⏮ 처음부터
              </Text>
            </Pressable>
          ) : (
            <View className="flex-row gap-2 mb-4">
              <Pressable
                onPress={handleRestart}
                className="flex-1 py-4 rounded-xl bg-sky-500 shadow-md"
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                android_ripple={{ color: '#0284C7' }}
              >
                <Text className="text-white text-[16px] font-bold text-center">
                  ⏮ 처음부터
                </Text>
              </Pressable>
              <Pressable
                onPress={handlePlayPause}
                className="flex-1 py-4 rounded-xl bg-sky-500 shadow-md"
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                android_ripple={{ color: '#0284C7' }}
              >
                <Text className="text-white text-[16px] font-bold text-center">
                  ▶ 재생
                </Text>
              </Pressable>
            </View>
          )
        ) : (
          <Pressable
            onPress={handlePlayPause}
            className="py-4 rounded-xl bg-sky-500 mb-4 shadow-md"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            android_ripple={{ color: '#0284C7' }}
            disabled={isLoading}
          >
            <Text className="text-white text-[18px] font-bold text-center">
              {isLoading ? '로딩 중...' : '▶ 재생'}
            </Text>
          </Pressable>
        )}

        {/* Progress Bar */}
        <View className="mb-2">
          <View className="h-2 bg-sky-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-sky-500 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
        </View>

        {/* Time Display */}
        <View className="flex-row justify-between">
          <Text className="text-sky-700 text-[12px] font-semibold">
            {formatTime(currentTime)}
          </Text>
          <Text className="text-sky-700 text-[12px] font-semibold">
            {formatTime(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
}
