import { GradientButton } from '@/components/home/GradientButton';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

const COMPREHENSION_LEVELS = [
  { value: 1, label: '매우 낮음', emoji: '😰' },
  { value: 2, label: '낮음', emoji: '😟' },
  { value: 3, label: '보통', emoji: '😐' },
  { value: 4, label: '높음', emoji: '🙂' },
  { value: 5, label: '매우 높음', emoji: '😊' },
];

const SPEECH_SPEED_LEVELS = [
  { value: 1, label: '매우 느림', emoji: '😪' },
  { value: 2, label: '느림', emoji: '🥱' },
  { value: 3, label: '적당함', emoji: '🙂' },
  { value: 4, label: '빠름', emoji: '😦' },
  { value: 5, label: '매우 빠름', emoji: '😰' },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const [selectedComprehension, setSelectedComprehension] = useState<
    number | null
  >(null);
  const [selectedSpeechSpeed, setSelectedSpeechSpeed] = useState<
    number | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedComprehension || !selectedSpeechSpeed || submitting) return;

    setSubmitting(true);
    try {
      // TODO: 백엔드 연동
      // await api.submitFeedback({ comprehension: selectedComprehension, speechSpeed: selectedSpeechSpeed });
      router.replace('/');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    selectedComprehension !== null && selectedSpeechSpeed !== null;

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <View className="flex-1 px-5">
        {/* 헤드라인 */}
        <View className="pt-16">
          <Text className="mb-2 text-3xl font-black text-neutral-900">
            학습 세션 완료!
          </Text>
          <Text className="text-base leading-6 text-neutral-600">
            이번 학습은 어떠셨나요?
          </Text>
        </View>

        {/* 평가 섹션 */}
        <View className="flex-1 pt-8">
          {/* 이해도 평가 */}
          <View className="mb-8">
            <Text className="mb-4 text-lg font-bold text-neutral-900">
              이해도
            </Text>
            <View className="flex-row justify-between">
              {COMPREHENSION_LEVELS.map((level) => {
                const isSelected = selectedComprehension === level.value;
                return (
                  <View style={{ width: '18%' }}>
                    <Pressable
                      onPress={() => setSelectedComprehension(level.value)}
                      android_ripple={{
                        color: 'rgba(0,0,0,0.08)',
                        borderless: false,
                      }}
                      style={({ pressed }) => ({
                        height: 80,
                        borderRadius: 12,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      })}
                      className={`items-center justify-center rounded-xl border-2 transition-all duration-150 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <Text className="mb-1 text-2xl">{level.emoji}</Text>
                      <Text
                        className={`text-center text-[11px] font-semibold ${
                          isSelected ? 'text-sky-700' : 'text-gray-700'
                        }`}
                        numberOfLines={2}
                      >
                        {level.label}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 발화속도 평가 */}
          <View className="mb-8">
            <Text className="mb-4 text-lg font-bold text-neutral-900">
              발화속도
            </Text>
            <View className="flex-row justify-between">
              {SPEECH_SPEED_LEVELS.map((level) => {
                const isSelected = selectedSpeechSpeed === level.value;
                return (
                  <View key={level.value} style={{ width: '18%' }}>
                    <Pressable
                      onPress={() => setSelectedSpeechSpeed(level.value)}
                      android_ripple={{
                        color: 'rgba(0,0,0,0.08)',
                        borderless: false,
                      }}
                      style={({ pressed }) => ({
                        height: 80,
                        borderRadius: 12,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      })}
                      className={`items-center justify-center rounded-xl border-2 transition-all duration-150 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <Text className="mb-1 text-2xl">{level.emoji}</Text>
                      <Text
                        className={`text-center text-[11px] font-semibold ${
                          isSelected ? 'text-sky-700' : 'text-gray-700'
                        }`}
                        numberOfLines={2}
                      >
                        {level.label}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* 제출 버튼 */}
        <View className="pb-8">
          <View className="px-2">
            <GradientButton
              title="제출하기"
              icon="send"
              loading={submitting}
              disabled={!canSubmit}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
