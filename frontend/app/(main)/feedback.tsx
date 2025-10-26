import Button from '@/components/home/Button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const DIFFICULTY_LEVELS = [
  { value: 1, label: '매우 쉬움', emoji: '😊', color: '#10b981' },
  { value: 2, label: '쉬움', emoji: '🙂', color: '#84cc16' },
  { value: 3, label: '적당함', emoji: '😐', color: '#eab308' },
  { value: 4, label: '어려움', emoji: '😟', color: '#f97316' },
  { value: 5, label: '매우 어려움', emoji: '😰', color: '#ef4444' },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(
    null,
  );

  const handleSubmit = () => {
    if (selectedDifficulty === null) {
      return;
    }

    // TODO: 오디오페이지랑 연결, 백엔드 연동

    router.back();
  };

  const selectedLevel = DIFFICULTY_LEVELS.find(
    (level) => level.value === selectedDifficulty,
  );

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <View className="flex-1 px-5">
        <View className="pt-16">
          <Text className="mb-2 text-3xl font-black text-neutral-900">
            학습 세션 완료!
          </Text>
          <Text className="text-base leading-6 text-neutral-600">
            이번 학습의 난이도는 어땠나요?
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          {selectedLevel ? (
            <View className="items-center">
              <View
                className="mb-6 h-32 w-32 items-center justify-center rounded-full"
                style={{
                  backgroundColor: selectedLevel.color + '20',
                }}
              >
                <Text className="text-7xl">{selectedLevel.emoji}</Text>
              </View>
              <Text className="text-2xl font-bold text-neutral-900">
                {selectedLevel.label}
              </Text>
            </View>
          ) : (
            <Text className="text-lg text-neutral-400">
              난이도를 선택해주세요
            </Text>
          )}
        </View>

        <View className="pb-8">
          <Text className="mb-4 text-center text-lg font-bold text-neutral-900">
            난이도 평가
          </Text>

          <View className="mb-6 flex-row justify-between">
            {DIFFICULTY_LEVELS.map((level) => (
              <Pressable
                key={level.value}
                onPress={() => setSelectedDifficulty(level.value)}
                className={`items-center justify-center rounded-xl border-2 p-3 ${
                  selectedDifficulty === level.value
                    ? 'border-primary bg-sky-50'
                    : 'border-neutral-200 bg-white'
                }`}
                style={{ width: '18%', height: 60 }}
              >
                <Text
                  className={`text-center text-xs font-semibold ${
                    selectedDifficulty === level.value
                      ? 'text-primary'
                      : 'text-neutral-900'
                  }`}
                  numberOfLines={2}
                >
                  {level.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="px-2">
            <Button
              title="제출하기"
              onPress={handleSubmit}
              disabled={selectedDifficulty === null}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
