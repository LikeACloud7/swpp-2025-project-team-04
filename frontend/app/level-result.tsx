import { View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

// ============ 타입 정의 ============

// CEFR 레벨 타입
type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// 개별 레벨 정보
type LevelDetail = {
  current_level: number; // 현재 레벨 스코어
  delta: number; // 변화량
  cefr_level: CEFRLevel; // 현재 CEFR 레벨
  next_level: CEFRLevel | null; // 다음 CEFR 레벨 (C2면 null)
  remaining_to_next: number; // 다음 레벨까지 남은 점수
  progress_in_current: number; // 현재 레벨 내 진행도 (0-100%)
  current_start: number; // 현재 레벨 시작 점수
  current_end: number; // 현재 레벨 끝 점수
};

// 피드백 응답 타입
export type FeedbackResponse = {
  average_level: number; // 평균 레벨
  average_delta: number; // 평균 변화량
  lexical: LevelDetail; // 어휘 레벨 상세
  syntactic: LevelDetail; // 문법 레벨 상세
  auditory: LevelDetail; // 청취 레벨 상세
};

// ============ 상수 정의 ============

// CEFR 레벨별 시작 점수
const LEVEL_THRESHOLDS: Record<CEFRLevel, number> = {
  A1: 0,
  A2: 25,
  B1: 50,
  B2: 100,
  C1: 150,
  C2: 200,
};

const MAX_SCORE = 300;
const ORDERED_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// 레벨별 색상
const LEVEL_COLORS = {
  lexical: '#3b82f6',
  syntactic: '#7c3aed',
  auditory: '#10b981',
};

// ============ 유틸리티 함수 ============

// 스코어로부터 CEFR 레벨 계산
function getCEFRLevel(score: number): CEFRLevel {
  if (score >= LEVEL_THRESHOLDS.C2) return 'C2';
  if (score >= LEVEL_THRESHOLDS.C1) return 'C1';
  if (score >= LEVEL_THRESHOLDS.B2) return 'B2';
  if (score >= LEVEL_THRESHOLDS.B1) return 'B1';
  if (score >= LEVEL_THRESHOLDS.A2) return 'A2';
  return 'A1';
}

// 다음 레벨 정보 계산
function getNextLevelInfo(
  currentLevel: CEFRLevel,
): { nextLevel: CEFRLevel; nextThreshold: number } | null {
  const currentIndex = ORDERED_LEVELS.indexOf(currentLevel);
  if (currentIndex === ORDERED_LEVELS.length - 1) return null; // C2는 다음 레벨 없음

  const nextLevel = ORDERED_LEVELS[currentIndex + 1];
  return {
    nextLevel,
    nextThreshold: LEVEL_THRESHOLDS[nextLevel],
  };
}

// 현재 레벨 범위의 끝 점수 계산
function getCurrentLevelEnd(currentLevel: CEFRLevel): number {
  const nextInfo = getNextLevelInfo(currentLevel);
  return nextInfo ? nextInfo.nextThreshold : MAX_SCORE;
}

// 레벨 상세 정보 계산
function calculateLevelDetail(score: number, delta: number): LevelDetail {
  const cefrLevel = getCEFRLevel(score);
  const currentStart = LEVEL_THRESHOLDS[cefrLevel];
  const currentEnd = getCurrentLevelEnd(cefrLevel);
  const nextInfo = getNextLevelInfo(cefrLevel);

  const remainingToNext = nextInfo ? nextInfo.nextThreshold - score : 0;
  const progressInCurrent =
    ((score - currentStart) / (currentEnd - currentStart)) * 100;

  return {
    current_level: score,
    delta,
    cefr_level: cefrLevel,
    next_level: nextInfo?.nextLevel || null,
    remaining_to_next: Math.max(0, remainingToNext),
    progress_in_current: Math.max(0, Math.min(100, progressInCurrent)),
    current_start: currentStart,
    current_end: currentEnd,
  };
}

// ============ 컴포넌트 ============

// 개별 레벨 카드 Props
type LevelCardProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  detail: LevelDetail;
  color: string;
};

function LevelCard({ title, icon, detail, color }: LevelCardProps) {
  const isPositive = detail.delta > 0;
  const isNegative = detail.delta < 0;

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm flex-1">
      {/* 헤더 */}
      <View className="flex-row items-center mb-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-2.5"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-800">{title}</Text>
          <Text className="text-xs text-gray-500">{detail.cefr_level}</Text>
        </View>
      </View>

      {/* 변화량 */}
      <View className="items-center mb-3">
        <View className="flex-row items-center">
          {isPositive && <Ionicons name="arrow-up" size={28} color="#10b981" />}
          {isNegative && (
            <Ionicons name="arrow-down" size={28} color="#ef4444" />
          )}
          <Text
            className={`ml-1 text-4xl font-bold ${
              isPositive
                ? 'text-green-600'
                : isNegative
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            {Math.abs(detail.delta).toFixed(1)}
          </Text>
        </View>
      </View>

      {/* 현재 스코어 (구간 기준) */}
      <View className="mb-3">
        <Text className="text-2xl font-bold" style={{ color }}>
          {detail.current_level.toFixed(1)}
          <Text className="text-sm text-gray-400">
            {' '}
            / {detail.current_end}
          </Text>
        </Text>
      </View>

      {/* 프로그레스 바 */}
      <View>
        <View className="flex-row justify-between mb-1.5">
          <Text className="text-xs text-gray-400">{detail.current_start}</Text>
          <Text className="text-xs text-gray-400">{detail.current_end}</Text>
        </View>
        <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${detail.progress_in_current}%`,
              backgroundColor: color,
            }}
          />
        </View>
      </View>
    </View>
  );
}

export default function LevelResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ============ URL 파라미터 파싱 (임시, 실제로는 API 응답 사용) ============
  const lexicalLevel = parseFloat(
    Array.isArray(params.lexical_level)
      ? params.lexical_level[0]
      : (params.lexical_level ?? '100'),
  );
  const syntacticLevel = parseFloat(
    Array.isArray(params.syntactic_level)
      ? params.syntactic_level[0]
      : (params.syntactic_level ?? '100'),
  );
  const speedLevel = parseFloat(
    Array.isArray(params.speed_level)
      ? params.speed_level[0]
      : (params.speed_level ?? '100'),
  );
  const lexicalDelta = parseFloat(
    Array.isArray(params.lexical_delta)
      ? params.lexical_delta[0]
      : (params.lexical_delta ?? '5'),
  );
  const syntacticDelta = parseFloat(
    Array.isArray(params.syntactic_delta)
      ? params.syntactic_delta[0]
      : (params.syntactic_delta ?? '3'),
  );
  const speedDelta = parseFloat(
    Array.isArray(params.speed_delta)
      ? params.speed_delta[0]
      : (params.speed_delta ?? '-2'),
  );

  // ============ 레벨 상세 정보 계산 ============
  const lexicalDetail = calculateLevelDetail(lexicalLevel, lexicalDelta);
  const syntacticDetail = calculateLevelDetail(syntacticLevel, syntacticDelta);
  const auditoryDetail = calculateLevelDetail(speedLevel, speedDelta);

  // ============ 평균 계산 ============
  const averageLevel = (lexicalLevel + syntacticLevel + speedLevel) / 3;
  const averageDelta = (lexicalDelta + syntacticDelta + speedDelta) / 3;
  const averageCefr = getCEFRLevel(averageLevel);

  // ============ 로깅 (개발용) ============
  useEffect(() => {
    console.log('📊 [레벨 결과 페이지] 계산된 데이터:', {
      average: { level: averageLevel, delta: averageDelta, cefr: averageCefr },
      lexical: lexicalDetail,
      syntactic: syntacticDetail,
      auditory: auditoryDetail,
    });
  }, []);

  const isAveragePositive = averageDelta > 0;
  const isAverageNegative = averageDelta < 0;

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <View className="flex-1 px-6 pt-16 pb-6">
        {/* 전체 평균 */}
        <View className="bg-[#6FA4D7] rounded-3xl p-8 mb-4 shadow-md items-center">
          <Text className="text-white text-xl font-semibold mb-1">
            평균 레벨
          </Text>
          <Text className="text-white/80 text-lg font-medium mb-3">
            {averageCefr}
          </Text>
          <Text className="text-white text-6xl font-bold mb-3">
            {averageLevel.toFixed(1)}
          </Text>
          <View className="flex-row items-center">
            {isAveragePositive && (
              <Ionicons name="arrow-up" size={18} color="white" />
            )}
            {isAverageNegative && (
              <Ionicons name="arrow-down" size={18} color="white" />
            )}
            <Text className="text-white font-semibold ml-1.5 text-lg">
              {Math.abs(averageDelta).toFixed(1)}
            </Text>
          </View>
        </View>

        {/* 개별 레벨 카드들 */}
        <View className="flex-1 gap-3">
          <View className="flex-1">
            <LevelCard
              title="어휘력"
              icon="book-outline"
              detail={lexicalDetail}
              color={LEVEL_COLORS.lexical}
            />
          </View>

          <View className="flex-1">
            <LevelCard
              title="문법"
              icon="git-network-outline"
              detail={syntacticDetail}
              color={LEVEL_COLORS.syntactic}
            />
          </View>

          <View className="flex-1">
            <LevelCard
              title="청취력"
              icon="headset-outline"
              detail={auditoryDetail}
              color={LEVEL_COLORS.auditory}
            />
          </View>
        </View>

        {/* 확인 버튼 */}
        <Pressable
          className="bg-[#6FA4D7] rounded-2xl py-3.5 mt-4 active:opacity-80"
          onPress={() => router.replace('/(main)')}
        >
          <Text className="text-white text-center text-base font-semibold">
            확인
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
