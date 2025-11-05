import { GradientButton } from '@/components/home/GradientButton';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDifficulty || submitting) return;

    setSubmitting(true);
    try {
      // TODO: 오디오페이지 연결 & 백엔드 연동
      // await api.submitDifficulty(selectedDifficulty);
      router.replace('/');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLevel = DIFFICULTY_LEVELS.find(
    (level) => level.value === selectedDifficulty,
  );

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <View className="flex-1 px-5">
        {/* 헤드라인 */}
        <View className="pt-16">
          <Text className="mb-2 text-3xl font-black text-neutral-900">
            학습 세션 완료!
          </Text>
          <Text className="text-base leading-6 text-neutral-600">
            이번 학습의 난이도는 어땠나요?
          </Text>
        </View>

        {/* 선택 상태 미리보기 */}
        <View className="flex-1 items-center justify-center">
          {selectedLevel ? (
            <View className="items-center">
              <View
                className="mb-6 h-32 w-32 items-center justify-center rounded-full"
                style={{ backgroundColor: selectedLevel.color + '20' }}
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

        {/* 선택 버튼들 + 제출 */}
        <View className="pb-8">
          <Text className="mb-4 text-center text-lg font-bold text-neutral-900">
            난이도 평가
          </Text>

          <View className="mb-6 flex-row justify-between">
            {DIFFICULTY_LEVELS.map((level) => {
              const isSelected = selectedDifficulty === level.value;
              return (
                <Pressable
                  key={level.value}
                  onPress={() => setSelectedDifficulty(level.value)}
                  android_ripple={{
                    color: 'rgba(0,0,0,0.08)',
                    borderless: false,
                  }}
                  style={({ pressed }) => ({
                    width: '18%',
                    height: 68,
                    borderRadius: 12,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                  className={`items-center justify-center rounded-xl border transition-all duration-150
          ${
            isSelected ? 'border-sky-500 bg-sky-50' : 'border-gray-300 bg-white'
          }
        `}
                >
                  <Text
                    className={`p-2 text-center text-[13px] font-semibold ${
                      isSelected ? 'text-sky-700' : 'text-gray-700'
                    }`}
                  >
                    {level.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="px-2">
            <GradientButton
              title="제출하기"
              icon="send"
              loading={submitting}
              disabled={!selectedDifficulty}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
