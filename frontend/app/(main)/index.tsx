import Button from '@/components/home/Button';
import { ChipSelectorGroup } from '@/components/home/ChipSelectorGroup';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import TrackPlayer, { Capability } from 'react-native-track-player';
import { PlaybackService } from '../PlaybackService';
import { useGenerateAudio } from '@/hooks/mutations/useAudioMutations';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

const THEME_OPTIONS = ['News', 'Sports', 'Travel', 'Science', 'Culture'];
const MOOD_OPTIONS = ['Calm', 'Energetic', 'Academic', 'Casual', 'Focused'];

export default function HomeScreen() {
  const qc = useQueryClient();
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // 오디오 api
  const { mutate: audioMutate, isPending: isAudioLoading } = useGenerateAudio();

  const handleGenerateAudio = () => {
    if (!selectedTheme || !selectedMood) {
      console.warn('Please select both theme and mood.');
      return;
    }

    audioMutate(
      {
        mood: selectedMood,
        theme: selectedTheme,
      },
      {
        onSuccess: async (data) => {
          console.log('Audio generation successful:', data);

          // RNTP에 트랙 추가 및 재생 준비
          await TrackPlayer.reset(); // 이전 트랙 제거 (선택)
          await TrackPlayer.add({
            url: data.audio_url,
            title: data.title,
            artist: 'LingoFit',
          });

          const id = uuidv4(); // 생성된 세션 ID

          // 캐시에 저장
          qc.setQueryData(['audio', id], data);

          // id만 전달
          router.replace({ pathname: '/audioPlayer', params: { id } });
        },
        onError: (error) => {
          console.error('Audio generation failed:', error);
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-5 pt-9"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-8 text-base text-slate-600">
          Tailor today&apos;s practice by choosing a theme and mood below.
        </Text>

        <ChipSelectorGroup
          title="Theme"
          chips={THEME_OPTIONS}
          onSelectionChange={setSelectedTheme}
        />

        <ChipSelectorGroup
          title="Mood"
          chips={MOOD_OPTIONS}
          onSelectionChange={setSelectedMood}
        />
      </ScrollView>

      <View className="px-5 pb-8">
        <Button
          title={isAudioLoading ? 'Generating…' : 'Generate Audio'}
          onPress={handleGenerateAudio}
          style={{ width: '100%' }}
          disabled={!selectedTheme || !selectedMood || isAudioLoading}
        />
      </View>
    </View>
  );
}
