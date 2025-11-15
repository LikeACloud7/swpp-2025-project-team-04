import { GradientButton } from '@/components/home/GradientButton';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

// ========== 행동 로그 + 피드백 데이터 타입 ==========
type FeedbackPayload = {
  generated_content_id: number;
  pause_cnt: number;
  rewind_cnt: number;
  vocab_lookup_cnt: number;
  vocab_save_cnt: number;
  understanding_difficulty: number;
  speed_difficulty: number; // TODO: UI 변경 후 명시적 입력 받기
};

const DIFFICULTY_LEVELS = [
  { value: 1, label: '매우 쉬움', emoji: '😊', color: '#10b981' },
  { value: 2, label: '쉬움', emoji: '🙂', color: '#84cc16' },
  { value: 3, label: '적당함', emoji: '😐', color: '#eab308' },
  { value: 4, label: '어려움', emoji: '😟', color: '#f97316' },
  { value: 5, label: '매우 어려움', emoji: '😰', color: '#ef4444' },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 오디오 플레이어에서 전달받은 행동 로그 데이터
  const generatedContentId = parseInt(
    Array.isArray(params.generated_content_id)
      ? params.generated_content_id[0]
      : params.generated_content_id ?? '0',
  );
  const pauseCount = parseInt(
    Array.isArray(params.pause_cnt) ? params.pause_cnt[0] : params.pause_cnt ?? '0',
  );
  const rewindCount = parseInt(
    Array.isArray(params.rewind_cnt) ? params.rewind_cnt[0] : params.rewind_cnt ?? '0',
  );
  const vocabLookupCount = parseInt(
    Array.isArray(params.vocab_lookup_cnt)
      ? params.vocab_lookup_cnt[0]
      : params.vocab_lookup_cnt ?? '0',
  );
  const vocabSaveCount = parseInt(
    Array.isArray(params.vocab_save_cnt)
      ? params.vocab_save_cnt[0]
      : params.vocab_save_cnt ?? '0',
  );

  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  // 페이지 마운트 시 넘어온 파라미터 로깅
  useEffect(() => {
    console.log('📥 [피드백 페이지] 받은 파라미터:', {
      generated_content_id: generatedContentId,
      pause_cnt: pauseCount,
      rewind_cnt: rewindCount,
      vocab_lookup_cnt: vocabLookupCount,
      vocab_save_cnt: vocabSaveCount,
    });
  }, [generatedContentId, pauseCount, rewindCount, vocabLookupCount, vocabSaveCount]);

  const handleSubmit = async () => {
    if (!selectedDifficulty || submitting) return;

    setSubmitting(true);
    try {
      // 완전한 피드백 데이터 페이로드 (7가지 필드)
      const payload: FeedbackPayload = {
        generated_content_id: generatedContentId,
        pause_cnt: pauseCount,
        rewind_cnt: rewindCount,
        vocab_lookup_cnt: vocabLookupCount,
        vocab_save_cnt: vocabSaveCount,
        understanding_difficulty: selectedDifficulty,
        speed_difficulty: 0, // TODO: UI 변경 후 명시적 입력 받기
      };

      console.log('📤 [피드백 제출]', payload);

      // TODO: 백엔드 API 연동
      // await api.submitFeedback(payload);

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
