import { GradientButton } from '@/components/home/GradientButton';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View, Alert } from 'react-native';
import { submitFeedback } from '@/api/feedback';

const UNDERSTANDING_DIFFICULTY_LEVELS = [
  { value: 1, label: '매우 낮음', emoji: '😰', backendValue: 4 },
  { value: 2, label: '낮음', emoji: '😟', backendValue: 3 },
  { value: 3, label: '보통', emoji: '😐', backendValue: 2 },
  { value: 4, label: '높음', emoji: '🙂', backendValue: 1 },
  { value: 5, label: '매우 높음', emoji: '😊', backendValue: 0 },
];

const SPEED_DIFFICULTY_LEVELS = [
  { value: 1, label: '매우 느림', emoji: '😪', backendValue: 4 },
  { value: 2, label: '느림', emoji: '🥱', backendValue: 3 },
  { value: 3, label: '적당함', emoji: '🙂', backendValue: 2 },
  { value: 4, label: '빠름', emoji: '😦', backendValue: 1 },
  { value: 5, label: '매우 빠름', emoji: '😰', backendValue: 0 },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 오디오 플레이어에서 전달받은 행동 로그 데이터
  const generatedContentId = parseInt(
    Array.isArray(params.generated_content_id)
      ? params.generated_content_id[0]
      : (params.generated_content_id ?? '0'),
  );
  const pauseCount = parseInt(
    Array.isArray(params.pause_cnt)
      ? params.pause_cnt[0]
      : (params.pause_cnt ?? '0'),
  );
  const rewindCount = parseInt(
    Array.isArray(params.rewind_cnt)
      ? params.rewind_cnt[0]
      : (params.rewind_cnt ?? '0'),
  );
  const vocabLookupCount = parseInt(
    Array.isArray(params.vocab_lookup_cnt)
      ? params.vocab_lookup_cnt[0]
      : (params.vocab_lookup_cnt ?? '0'),
  );
  const vocabSaveCount = parseInt(
    Array.isArray(params.vocab_save_cnt)
      ? params.vocab_save_cnt[0]
      : (params.vocab_save_cnt ?? '0'),
  );

  const [selectedUnderstandingDifficulty, setSelectedUnderstandingDifficulty] =
    useState<number | null>(null);
  const [selectedSpeedDifficulty, setSelectedSpeedDifficulty] = useState<
    number | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedUnderstandingDifficulty !== null) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedUnderstandingDifficulty]);

  // 페이지 마운트 시 넘어온 파라미터 로깅
  useEffect(() => {
    console.log('📥 [피드백 페이지] 받은 파라미터:', {
      generated_content_id: generatedContentId,
      pause_cnt: pauseCount,
      rewind_cnt: rewindCount,
      vocab_lookup_cnt: vocabLookupCount,
      vocab_save_cnt: vocabSaveCount,
    });
  }, [
    generatedContentId,
    pauseCount,
    rewindCount,
    vocabLookupCount,
    vocabSaveCount,
  ]);

  const handleSubmit = async () => {
    if (
      !selectedUnderstandingDifficulty ||
      !selectedSpeedDifficulty ||
      submitting
    )
      return;

    setSubmitting(true);
    try {
      // UI 값을 백엔드 값으로 변환
      const understandingBackendValue =
        UNDERSTANDING_DIFFICULTY_LEVELS.find(
          (l) => l.value === selectedUnderstandingDifficulty,
        )?.backendValue ?? 0;

      const speedBackendValue =
        SPEED_DIFFICULTY_LEVELS.find((l) => l.value === selectedSpeedDifficulty)
          ?.backendValue ?? 0;

      // 완전한 피드백 데이터 페이로드 (7가지 필드)
      const payload = {
        generated_content_id: generatedContentId,
        pause_cnt: pauseCount,
        rewind_cnt: rewindCount,
        vocab_lookup_cnt: vocabLookupCount,
        vocab_save_cnt: vocabSaveCount,
        understanding_difficulty: understandingBackendValue,
        speed_difficulty: speedBackendValue,
      };

      console.log('📤 [피드백 제출]', payload);

      const response = await submitFeedback(payload);

      console.log('[피드백 제출 성공]');
      console.log(JSON.stringify(payload, null, 2));

      router.replace('/');
    } catch (error) {
      console.error('[피드백 제출 실패]', error);
      Alert.alert(
        '피드백 제출 실패',
        '피드백을 제출하는 중 문제가 발생했습니다. 다시 시도해주세요.',
        [{ text: '확인' }],
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    selectedUnderstandingDifficulty !== null &&
    selectedSpeedDifficulty !== null;

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
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-neutral-900">
                  이해도
                </Text>
                <Text className="mt-1 text-sm text-neutral-500">
                  내용중 얼마를 이해하셨나요?
                </Text>
              </View>
              {selectedUnderstandingDifficulty !== null && (
                <Text className="text-4xl">
                  {
                    UNDERSTANDING_DIFFICULTY_LEVELS.find(
                      (l) => l.value === selectedUnderstandingDifficulty,
                    )?.emoji
                  }
                </Text>
              )}
            </View>
            <View className="flex-row gap-2">
              {UNDERSTANDING_DIFFICULTY_LEVELS.map((level) => {
                const isSelected =
                  selectedUnderstandingDifficulty === level.value;
                return (
                  <View key={level.value} style={{ flex: 1 }}>
                    <Pressable
                      onPress={() =>
                        setSelectedUnderstandingDifficulty(level.value)
                      }
                      android_ripple={{
                        color: 'rgba(0,0,0,0.08)',
                        borderless: false,
                      }}
                      style={({ pressed }) => ({
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      })}
                      className={`items-center justify-center rounded-xl border-2 py-6 transition-all duration-150 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-center text-sm font-semibold ${
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
          {selectedUnderstandingDifficulty !== null && (
            <Animated.View
              className="mb-8"
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <View className="mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-neutral-900">
                    발화속도
                  </Text>
                  <Text className="mt-1 text-sm text-neutral-500">
                    말하기 속도는 어땠나요?
                  </Text>
                </View>
                {selectedSpeedDifficulty !== null && (
                  <Text className="text-4xl">
                    {
                      SPEED_DIFFICULTY_LEVELS.find(
                        (l) => l.value === selectedSpeedDifficulty,
                      )?.emoji
                    }
                  </Text>
                )}
              </View>
              <View className="flex-row gap-2">
                {SPEED_DIFFICULTY_LEVELS.map((level) => {
                  const isSelected = selectedSpeedDifficulty === level.value;
                  return (
                    <View key={level.value} style={{ flex: 1 }}>
                      <Pressable
                        onPress={() => setSelectedSpeedDifficulty(level.value)}
                        android_ripple={{
                          color: 'rgba(0,0,0,0.08)',
                          borderless: false,
                        }}
                        style={({ pressed }) => ({
                          transform: [{ scale: pressed ? 0.98 : 1 }],
                        })}
                        className={`items-center justify-center rounded-xl border-2 py-6 transition-all duration-150 ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-center text-sm font-semibold ${
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
            </Animated.View>
          )}
        </View>

        {/* 제출 버튼 */}
        <View className="pb-8">
          <View className="px-2 gap-3">
            <GradientButton
              title="제출하기"
              icon="send"
              loading={submitting}
              disabled={!canSubmit}
              onPress={handleSubmit}
            />
            <Pressable
              onPress={() => router.replace('/')}
              className="py-4 rounded-xl bg-gray-200"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-gray-700 text-center text-base font-semibold">
                피드백 건너뛰기
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
