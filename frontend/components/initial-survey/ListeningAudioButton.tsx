import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, Alert } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { getAudioUrl } from '@/api/initialSurvey';
import { getAccessToken } from '@/utils/tokenManager';
import * as FileSystem from 'expo-file-system/legacy';

type ListeningAudioButtonProps = {
  level: string;
  questionNumber: number;
};

export default function ListeningAudioButton({
  level,
  questionNumber,
}: ListeningAudioButtonProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadedUri, setDownloadedUri] = useState<string | null>(null);

  // 백엔드 API에서 오디오 파일 URL 생성
  const audioUrl = useMemo(() => {
    if (!level) return '';
    return getAudioUrl(level, questionNumber);
  }, [level, questionNumber]);

  // expo-audio player
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  // 현재 시간 update
  useEffect(() => {
    if (!status?.playing) return;

    const interval = setInterval(() => {
      setCurrentTime(status.currentTime || 0);
    }, 100); // 100ms update

    return () => clearInterval(interval);
  }, [status?.playing, status?.currentTime]);

  // 끝나면 시간 리셋
  useEffect(() => {
    if (status?.currentTime === status?.duration && status?.duration > 0) {
      setCurrentTime(0);
    }
  }, [status?.currentTime, status?.duration]);

  const handlePlayPause = useCallback(async () => {
    if (!player) return;

    try {
      if (status?.playing) {
        player.pause();
      } else {
        if (downloadedUri) {
          player.play();
          return;
        }

        if (!audioUrl) return;

        setIsLoading(true);

        const accessToken = getAccessToken();

        const fileName = `audio_${level}_${questionNumber}.wav`;
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

        const downloadResult = await FileSystem.downloadAsync(
          audioUrl,
          fileUri,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (downloadResult.status !== 200) {
          throw new Error(`Failed to download audio`);
        }

        setDownloadedUri(downloadResult.uri);

        player.replace({ uri: downloadResult.uri });
        player.play();
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to load audio:', error);
      setIsLoading(false);
      Alert.alert('오디오 재생 오류', '오디오 파일을 불러올 수 없습니다.');
    }
  }, [player, status?.playing, status?.duration, currentTime, audioUrl, downloadedUri, level, questionNumber]);

  const handleRestart = useCallback(() => {
    if (!player || !downloadedUri) return;

    player.seekTo(0);
    setCurrentTime(0);
    player.play();
  }, [player, downloadedUri]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const duration = status?.duration || 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <View className="items-center mt-8 mb-4 w-full px-4">
      <View className="w-full max-w-[320px] bg-white rounded-2xl p-6 shadow-md">
        <Text className="text-gray-800 text-[16px] font-bold text-center mb-4">
          오디오 {questionNumber}
        </Text>

        {/* Play/Pause Button(s) */}
        {status?.playing ? (
          <Pressable
            onPress={handlePlayPause}
            className="py-4 rounded-xl bg-[#6FA4D7] mb-4"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            android_ripple={{ color: '#4D7BAA' }}
          >
            <Text className="text-white text-[18px] font-bold text-center">
              ⏸ 일시정지
            </Text>
          </Pressable>
        ) : downloadedUri && !isLoading ? (
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={handleRestart}
              className="flex-1 py-4 rounded-xl bg-[#6FA4D7]"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              android_ripple={{ color: '#4D7BAA' }}
            >
              <Text className="text-white text-[16px] font-bold text-center">
                ⏮ 처음부터
              </Text>
            </Pressable>
            <Pressable
              onPress={handlePlayPause}
              className="flex-1 py-4 rounded-xl bg-[#6FA4D7]"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              android_ripple={{ color: '#4D7BAA' }}
            >
              <Text className="text-white text-[16px] font-bold text-center">
                ▶ 재생
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handlePlayPause}
            className="py-4 rounded-xl bg-[#6FA4D7] mb-4"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            android_ripple={{ color: '#4D7BAA' }}
            disabled={isLoading}
          >
            <Text className="text-white text-[18px] font-bold text-center">
              {isLoading ? '로딩 중...' : '▶ 재생'}
            </Text>
          </Pressable>
        )}

        {/* Progress Bar */}
        <View className="mb-2">
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-[#6FA4D7] rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
        </View>

        {/* Time Display */}
        <View className="flex-row justify-between">
          <Text className="text-gray-600 text-[12px]">
            {formatTime(currentTime)}
          </Text>
          <Text className="text-gray-600 text-[12px]">
            {formatTime(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
}
