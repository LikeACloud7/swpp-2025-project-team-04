import Button from '@/components/home/Button';
import { ChipSelectorGroup } from '@/components/home/ChipSelectorGroup';
import { MOOD_OPTIONS, THEME_OPTIONS } from '@/constants/homeOptions';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from '../PlaybackService';

// RNTP 서비스 등록
TrackPlayer.registerPlaybackService(() => PlaybackService);

export default function HomeScreen() {
  const router = useRouter();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const focusMessage = useMemo(() => {
    if (!selectedThemes.length) {
      return (
        <Text className="text-base leading-6 text-neutral-600">
          테마와 분위기를 선택하면 맞춤 학습 계획이 제공됩니다.
        </Text>
      );
    }

    const primaryTheme = selectedThemes[0];

    if (!selectedMoods.length) {
      return (
        <Text className="text-base leading-6 text-neutral-600">
          <Text className="font-bold">{primaryTheme}</Text> 주제로 맞춤 콘텐츠를
          준비해드립니다.
        </Text>
      );
    }

    const moodTone = selectedMoods.join(', ');
    return (
      <Text className="text-base leading-6 text-neutral-600">
        <Text className="font-bold">{primaryTheme}</Text> 주제로{' '}
        <Text className="font-bold">{moodTone}</Text> 분위기의 콘텐츠를
        준비해드립니다.
      </Text>
    );
  }, [selectedThemes, selectedMoods]);

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-gradient-to-br from-primary to-sky-600 px-6 pb-4 pt-24">
          <View className="mb-6 rounded-2xl bg-white px-5 py-4">
            <View className="mb-3 flex-row items-center">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500">
                <Text className="text-2xl">🔥</Text>
              </View>

              <View>
                <Text className="text-sm font-black text-neutral-600">
                  연속 학습
                </Text>
                <Text className="text-xl font-black text-neutral-900">0일</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                <View key={day} className="items-center">
                  <Text className="mb-2 text-xs font-semibold text-neutral-400">
                    {day}
                  </Text>
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-neutral-200">
                    <View className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500' : 'bg-transparent'}`} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Text className="mb-2 text-2xl font-black text-neutral-900">
            맞춤 학습 시작하기
          </Text>
          <Text className="text-base font-black leading-6 text-neutral-700">
            오늘의 학습을 위해 테마와 분위기를 선택하세요.
          </Text>
        </View>

        <View className="px-5 pt-3">
          <ChipSelectorGroup
            title="테마"
            chips={THEME_OPTIONS}
            onSelectionChange={setSelectedThemes}
          />

          <ChipSelectorGroup
            title="분위기"
            chips={MOOD_OPTIONS}
            isMultiSelect
            onSelectionChange={setSelectedMoods}
          />

          <View className="mt-2 rounded-2xl bg-white p-6 shadow-sm">
            <View className="mb-3 flex-row items-center">
              <Text className="flex-1 text-lg font-bold text-neutral-900">
                오늘의 학습
              </Text>
            </View>
            {focusMessage}
          </View>

          <View className="mt-6">
            <Button
              title="오디오 생성하기"
              onPress={() => {
              }}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
