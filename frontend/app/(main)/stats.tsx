import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import type { Achievement } from '@/api/stats'; // Achievement 타입은 모달을 위해 계속 사용
import { useStats } from '@/hooks/queries/useStatsQueries';

export default function StatsScreen() {
  const { data: stats, isLoading, error } = useStats();

  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

  // --- [수정 1] ---
  // API 로딩이 끝나야 stats가 존재하므로, 로딩/에러 처리 '이후'로 이동함.
  // -----------------

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EBF4FB]">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EBF4FB] px-6">
        <Text className="text-center text-lg font-semibold text-neutral-700">
          통계를 불러올 수 없습니다
        </Text>
        <Text className="mt-2 text-center text-sm text-neutral-500">
          {error instanceof Error ? error.message : '다시 시도해주세요'}
        </Text>
      </View>
    );
  }

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDayOfWeek = today.getDay();
  const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - daysSinceMonday);
  mondayDate.setHours(0, 0, 0, 0);

  console.log('=== WEEKLY ACTIVITY DEBUG ===');
  console.log('Today:', formatLocalDate(today));
  console.log('Monday of this week:', formatLocalDate(mondayDate));
  console.log(
    'API daily_minutes data:',
    JSON.stringify(stats.streak.daily_minutes, null, 2),
  );

  const weeklyActivity = weekDays.map((_, index) => {
    const dayData = stats.streak.daily_minutes[index];
    return dayData ? dayData.minutes : 0;
  });

  const actualWeeklyTotal = weeklyActivity.reduce((sum, minutes) => sum + minutes, 0);
  const maxMinutes = Math.max(...weeklyActivity, 1);

  // Helper function to calculate progress within current level
  const calculateLevelProgress = (score: number, cefr_level: string) => {
    const levelRanges = {
      A1: { min: 0, max: 25 },
      A2: { min: 25, max: 50 },
      B1: { min: 50, max: 100 },
      B2: { min: 100, max: 150 },
      C1: { min: 150, max: 200 },
      C2: { min: 200, max: 300 },
    };

    const range = levelRanges[cefr_level as keyof typeof levelRanges];
    if (!range) return { progress: 0, current: 0, total: 0 };

    const current = Math.max(0, score - range.min);
    const total = range.max - range.min;
    const progress = Math.min(100, (current / total) * 100);

    return { progress, current: Math.round(current), total };
  };

  //Mock
  const mockAchievements = [
    {
      code: 'first_step',
      name: '첫 걸음',
      description: '첫 번째 레슨 완료',
      category: 'beginner',
      achieved: true,
      achieved_at: '2025-10-28T10:00:00Z',
    },
    {
      code: 'week_warrior',
      name: '일주일 전사',
      description: '7일 연속 학습',
      category: 'streak',
      achieved: false,
      achieved_at: null,
    },
    {
      code: 'early_bird',
      name: '아침형 인간',
      description: '오전 9시 이전 학습 5회',
      category: 'time',
      achieved: false,
      achieved_at: null,
    },
    {
      code: 'night_owl',
      name: '올빼미',
      description: '밤 10시 이후 학습 10회',
      category: 'time',
      achieved: false,
      achieved_at: null,
    },
    {
      code: 'hour_master',
      name: '한 시간의 마법',
      description: '총 학습 시간 1시간 달성',
      category: 'time',
      achieved: false,
      achieved_at: null,
    },
    {
      code: 'ten_hour_hero',
      name: '10시간 영웅',
      description: '총 학습 시간 10시간 달성',
      category: 'time',
      achieved: false,
      achieved_at: null,
    },
    {
      code: 'month_master',
      name: '꾸준함',
      description: '30일 연속 학습',
      category: 'streak',
      achieved: false,
      achieved_at: null,
    },
    {
      code: 'level_up',
      name: '레벨업',
      description: '최초 레벨에서 레벨업',
      category: 'level',
      achieved: false,
      achieved_at: null,
    },
    {
      code: '100_hours',
      name: '100 시간',
      description: '총 학습시간 6000분 달성',
      category: 'mastery',
      achieved: false,
      achieved_at: null,
    },
    {
      code: 'vocab_rookie',
      name: '단어 초보',
      description: '단어 100개 학습',
      category: 'vocabulary',
      achieved: false,
      achieved_at: null,
    },
    {
      code: 'vocab_expert',
      name: '단어 전문가',
      description: '단어 500개 학습',
      category: 'vocabulary',
      achieved: false,
      achieved_at: null,
    },
    {
      code: 'speed_demon',
      name: '스피드 러너',
      description: '하루에 5개 레슨 완료',
      category: 'special',
      achieved: false,
      achieved_at: null,
    },
  ];

  const achievements = mockAchievements;
  const achievedCount = achievements.filter((a) => a.achieved).length;
  const totalAchievements = achievements.length;

  const getAchievementEmoji = (category: string) => {
    // API의 카테고리 값에 맞게 수정
    const emojiMap: Record<string, string> = {
      milestone: '🌱', // 'FIRST_SESSION'
      progress: '🏆', // 'level_a2' 등
      consistency: '🔥', // 'streak_7'
      streak: '🔥', // 'STREAK_3'
      dedication: '⭐', // 'total_10_hours'
      time: '⏰', // 'TOTAL_300'
      exploration: '✨', // 'variety_master'
      // (기존 mock 데이터 기준)
      beginner: '🌱',
      level: '🏆',
      mastery: '⭐',
      vocabulary: '📚',
      special: '✨',
    };
    return emojiMap[category] || '🏆'; // 모르는 카테고리는 기본값
  };

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  // 주간 활동 하이라이트를 위해 '오늘 요일 인덱스' 계산
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  console.log('stats data:', stats);

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ----- 현재 레벨 ----- */}
        <View className="bg-primary px-6 py-6">
          <View className="mb-4 rounded-3xl bg-white p-6 shadow-sm">
            <View className="mb-3">
              <Text className="text-base font-bold text-neutral-700">
                현재 레벨
              </Text>
            </View>
            <View className="items-center py-4">
              <View className="mb-3 h-24 w-24 items-center justify-center rounded-full bg-primary shadow-sm">
                <Text className="text-4xl font-black text-white">
                  {stats.current_level.overall_cefr_level.cefr_level}
                </Text>
              </View>
              <Text className="mb-3 text-center text-sm font-semibold text-neutral-600">
                종합 레벨
              </Text>

              <View className="mt-2 w-full space-y-2">
                <View className="rounded-xl bg-neutral-50 p-3">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-xs font-semibold text-neutral-600">
                      어휘력 ({stats.current_level.lexical.cefr_level})
                    </Text>
                    <Text className="text-sm font-bold text-primary">
                      {
                        calculateLevelProgress(
                          stats.current_level.lexical.score,
                          stats.current_level.lexical.cefr_level,
                        ).current
                      }
                      /
                      {
                        calculateLevelProgress(
                          stats.current_level.lexical.score,
                          stats.current_level.lexical.cefr_level,
                        ).total
                      }
                    </Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-neutral-200">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${calculateLevelProgress(stats.current_level.lexical.score, stats.current_level.lexical.cefr_level).progress}%`,
                        backgroundColor: '#3b82f6',
                      }}
                    />
                  </View>
                </View>

                <View className="rounded-xl bg-neutral-50 p-3">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-xs font-semibold text-neutral-600">
                      문법 ({stats.current_level.syntactic.cefr_level})
                    </Text>
                    <Text className="text-sm font-bold text-primary">
                      {
                        calculateLevelProgress(
                          stats.current_level.syntactic.score,
                          stats.current_level.syntactic.cefr_level,
                        ).current
                      }
                      /
                      {
                        calculateLevelProgress(
                          stats.current_level.syntactic.score,
                          stats.current_level.syntactic.cefr_level,
                        ).total
                      }
                    </Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-neutral-200">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${calculateLevelProgress(stats.current_level.syntactic.score, stats.current_level.syntactic.cefr_level).progress}%`,
                        backgroundColor: '#7c3aed',
                      }}
                    />
                  </View>
                </View>

                <View className="rounded-xl bg-neutral-50 p-3">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-xs font-semibold text-neutral-600">
                      청취력 ({stats.current_level.auditory.cefr_level})
                    </Text>
                    <Text className="text-sm font-bold text-primary">
                      {
                        calculateLevelProgress(
                          stats.current_level.auditory.score,
                          stats.current_level.auditory.cefr_level,
                        ).current
                      }
                      /
                      {
                        calculateLevelProgress(
                          stats.current_level.auditory.score,
                          stats.current_level.auditory.cefr_level,
                        ).total
                      }
                    </Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-neutral-200">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${calculateLevelProgress(stats.current_level.auditory.score, stats.current_level.auditory.cefr_level).progress}%`,
                        backgroundColor: '#10b981',
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ----- 연속 학습 & 총 학습 시간 ----- */}
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-white p-5 shadow-sm">
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons name="flame" size={20} color="#EF4444" />
                <Text className="text-xs font-bold text-neutral-600">
                  연속 학습
                </Text>
              </View>
              <Text className="text-3xl font-black text-neutral-900">
                {stats.streak.consecutive_days}
              </Text>
              <Text className="text-xs font-semibold text-neutral-400">
                일 연속
              </Text>
            </View>

            <View className="flex-1 rounded-2xl bg-white p-5 shadow-sm">
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons name="time" size={20} color="#8B5CF6" />
                <Text className="text-xs font-bold text-neutral-600">
                  총 학습 시간
                </Text>
              </View>
              <Text className="text-3xl font-black text-neutral-900">
                {stats.total_time_spent_minutes}
              </Text>
              <Text className="text-xs font-semibold text-neutral-400">분</Text>
            </View>
          </View>
        </View>

        <View className="px-5 pt-4">
          {/* ----- 주간 활동 ----- */}
          <View className="mb-4 rounded-3xl bg-white p-6 shadow-sm">
            <View className="mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="bar-chart" size={24} color="#0EA5E9" />
                <Text className="text-lg font-bold text-neutral-900">
                  주간 활동
                </Text>
              </View>
              <View className="rounded-full bg-primary/10 px-3 py-1">
                <Text className="text-sm font-bold text-primary">
                  {actualWeeklyTotal}분
                </Text>
              </View>
            </View>

            <View
              className="flex-row items-end justify-between gap-2"
              style={{ height: 140 }}
            >
              {/* weeklyActivity 배열은 이제 [월, 화, 수 ... 일] 순서가 보장됨 */}
              {weeklyActivity.map((minutes, index) => {
                const barHeight =
                  maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
                const isToday =
                  index ===
                  (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                
                const dayDate = new Date(mondayDate);
                dayDate.setDate(mondayDate.getDate() + index);
                const dateString = dayDate.getDate().toString();

                return (
                  <View key={index} className="flex-1 items-center">
                    <View className="w-full flex-1 justify-end pb-2">
                      {minutes > 0 && (
                        <Text className="mb-1 text-center text-xs font-bold text-primary">
                          {minutes}
                        </Text>
                      )}
                      <View
                        className={`w-full rounded-t-lg ${
                          isToday ? 'bg-primary' : 'bg-sky-200'
                        }`}
                        style={{
                          height: `${Math.max(barHeight, minutes > 0 ? 10 : 0)}%`,
                          minHeight: minutes > 0 ? 8 : 0,
                        }}
                      />
                    </View>
                    <Text
                      className={`mt-2 text-xs font-bold ${
                        isToday ? 'text-primary' : 'text-neutral-400'
                      }`}
                    >
                      {weekDays[index]}
                    </Text>
                    <Text
                      className={`text-[10px] font-semibold ${
                        isToday ? 'text-primary' : 'text-neutral-400'
                      }`}
                    >
                      {dateString}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ----- 나의 배지 ----- */}
          <View className="rounded-3xl bg-white p-6 shadow-sm">
            <View className="mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="medal" size={24} color="#F59E0B" />
                <Text className="text-lg font-bold text-neutral-900">
                  나의 배지
                </Text>
              </View>
              <View className="rounded-full bg-amber-100 px-3 py-1">
                <Text className="text-sm font-bold text-amber-600">
                  {achievedCount} / {totalAchievements}
                </Text>
              </View>
            </View>

            {achievements.length === 0 ? (
              <View className="items-center py-8">
                <Ionicons name="trophy-outline" size={48} color="#D1D5DB" />
                <Text className="mt-3 text-center text-sm font-semibold text-neutral-400">
                  아직 획득한 배지가 없습니다
                </Text>
                <Text className="mt-1 text-center text-xs text-neutral-400">
                  학습을 계속하여 배지를 획득하세요!
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {achievements.map((achievement) => (
                  <Pressable
                    key={achievement.code}
                    onPress={() => handleAchievementPress(achievement)}
                    className="mb-3 w-[31%] items-center rounded-2xl bg-neutral-50 p-3 active:opacity-70"
                  >
                    <View
                      className={`mb-3 h-16 w-16 items-center justify-center rounded-2xl shadow-md ${
                        achievement.achieved ? 'bg-amber-500' : 'bg-neutral-200'
                      }`}
                    >
                      <Text
                        className="text-3xl"
                        style={{ opacity: achievement.achieved ? 1 : 0.3 }}
                      >
                        {getAchievementEmoji(achievement.category)}
                      </Text>
                    </View>
                    <Text
                      className={`text-center text-xs font-bold ${
                        achievement.achieved
                          ? 'text-neutral-900'
                          : 'text-neutral-400'
                      }`}
                      numberOfLines={2}
                    >
                      {achievement.name}
                    </Text>
                    {achievement.achieved && achievement.achieved_at && (
                      <View className="mt-1 rounded-full bg-amber-100 px-2 py-0.5">
                        <Text className="text-center text-[10px] font-semibold text-amber-700">
                          {new Date(achievement.achieved_at).toLocaleDateString(
                            'ko-KR',
                            {
                              month: 'short',
                              day: 'numeric',
                            },
                          )}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ----- 배지 상세 모달 ----- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50"
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            className="mx-6 w-4/5 rounded-3xl bg-white p-6 shadow-sm"
            onPress={(e) => e.stopPropagation()}
          >
            {selectedAchievement && (
              <>
                <View className="items-center">
                  <View
                    className={`mb-4 h-24 w-24 items-center justify-center rounded-3xl shadow-sm ${
                      selectedAchievement.achieved
                        ? 'bg-amber-500'
                        : 'bg-neutral-200'
                    }`}
                  >
                    <Text
                      className="text-5xl"
                      style={{
                        opacity: selectedAchievement.achieved ? 1 : 0.3,
                      }}
                    >
                      {getAchievementEmoji(selectedAchievement.category)}
                    </Text>
                  </View>

                  <Text className="mb-2 text-center text-2xl font-black text-neutral-900">
                    {selectedAchievement.name}
                  </Text>

                  <View
                    className={`mb-4 rounded-full px-4 py-1 ${
                      selectedAchievement.achieved
                        ? 'bg-green-100'
                        : 'bg-neutral-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        selectedAchievement.achieved
                          ? 'text-green-700'
                          : 'text-neutral-500'
                      }`}
                    >
                      {selectedAchievement.achieved
                        ? '✓ 달성 완료'
                        : '🔒 미달성'}
                    </Text>
                  </View>

                  <View className="w-full rounded-2xl bg-neutral-50 p-4">
                    <Text className="mb-2 text-xs font-bold text-neutral-500">
                      달성 방법
                    </Text>
                    <Text className="text-center text-sm font-semibold text-neutral-700">
                      {selectedAchievement.description}
                    </Text>
                  </View>

                  {selectedAchievement.achieved &&
                    selectedAchievement.achieved_at && (
                      <View className="mt-4 w-full rounded-2xl bg-amber-50 p-3">
                        <Text className="mb-1 text-center text-xs font-bold text-amber-700">
                          달성 일자
                        </Text>
                        <Text className="text-center text-sm font-semibold text-amber-900">
                          {new Date(
                            selectedAchievement.achieved_at,
                          ).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                    )}
                </View>

                <Pressable
                  className="mt-6 rounded-2xl bg-primary py-4"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-center text-base font-bold text-white">
                    닫기
                  </Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
