import { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { getAudioUrl } from '@/api/initialSurvey';

type ListeningAudioButtonProps = {
  level: string;
  questionNumber: number;
};

export default function ListeningAudioButton({
  level,
  questionNumber,
}: ListeningAudioButtonProps) {
  // 백엔드 API에서 오디오 파일 URL 생성
  const audioUrl = useMemo(() => {
    if (!level) return '';
    return getAudioUrl(level, questionNumber);
  }, [level, questionNumber]);

  // expo-audio player
  const player = useAudioPlayer(audioUrl);
  const status = useAudioPlayerStatus(player);

  const handlePress = useCallback(() => {
    if (!player) return;
    if (status?.playing) {
      // 정지 + 처음으로 리셋
      player.pause();
      player.seekTo(0);
    } else {
      // 항상 처음부터 재생
      player.seekTo(0);
      player.play();
    }
  }, [player, status?.playing]);

  return (
    <View className="items-center mt-6">
      <Pressable
        onPress={handlePress}
        className="w-[140px] py-3 rounded-full bg-[#6FA4D7]"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        android_ripple={{ color: '#4D7BAA' }}
      >
        <Text className="text-white text-lg font-semibold text-center">
          {status?.playing ? '정지' : '재생'}
        </Text>
      </Pressable>
    </View>
  );
}
