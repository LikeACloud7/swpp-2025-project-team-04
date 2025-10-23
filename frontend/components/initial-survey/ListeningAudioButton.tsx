import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

const audioSources = {
  1: require('@/assets/audio/1_audio.mp3'),
  2: require('@/assets/audio/2_audio.mp3'),
  3: require('@/assets/audio/3_audio.mp3'),
  4: require('@/assets/audio/4_audio.mp3'),
  5: require('@/assets/audio/5_audio.mp3'),
} as const;

type ListeningAudioButtonProps = {
  fileNumber: keyof typeof audioSources;
};

export default function ListeningAudioButton({
  fileNumber,
}: ListeningAudioButtonProps) {
  const audioSource = audioSources[fileNumber];

  // expo-audio player (컴포넌트 라이프사이클에 맞춰 자동 관리됨)
  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player); // { isPlaying, duration, currentTime, isLoaded, ... }

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

  if (!audioSource) return null;

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
