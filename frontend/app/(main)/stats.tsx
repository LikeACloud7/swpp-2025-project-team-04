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

  // --- [수정 1] ---
  // stats가 존재함이 보장되는 여기로 로직 이동
  // 1. [월, 화, 수, 목, 금, 토, 일] (총 7칸)에 맞는 0으로 채워진 배열 생성
  const weeklyActivity = Array(7).fill(0);

  // 2. API에서 받은 daily_minutes 데이터를 순회
  stats.streak.daily_minutes.forEach((dayData) => {
    const date = new Date(dayData.date); // 3. 날짜(string)를 Date 객체로 변환
    const dayOfWeek = date.getDay(); // 4. 요일(일=0, 월=1 ... 토=6)
    const chartIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // (월=0 ... 일=6)

    // 5. 올바른 요일 인덱스에 학습 시간(minutes)을 넣음
    // (API가 7일치만 준다는 가정 하에)
    if (chartIndex >= 0 && chartIndex < 7) {
      weeklyActivity[chartIndex] = dayData.minutes;
    }
  });

  // 6. maxMinutes 계산 (데이터 구조에 맞게)
  const maxMinutes = Math.max(
    ...stats.streak.daily_minutes.map((d) => d.minutes),
    1, // 0으로 나누는 것을 방지하기 위해 최소 1
  );
  // -----------------

  // --- [수정 3] ---
  // Mock 데이터 제거. 실제 API 데이터 사용
  const achievements = stats.achievements;
  // -----------------
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
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-bold text-neutral-700">
                현재 레벨
              </Text>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
            </View>
            <View className="items-center py-4">
              <View className="mb-3 h-24 w-24 items-center justify-center rounded-full bg-primary shadow-sm">
                <Text className="text-4xl font-black text-white">
                  {/* API 데이터의 level_description이 없으므로 level을 바로 표시 */}
                  {stats.current_level.level}
                </Text>
              </View>
              {/* API 응답에 level_description이 없으므로 이 라인은 주석 처리하거나 제거 */}
              {/* <Text className="mb-3 text-center text-sm font-semibold text-neutral-600">
                {stats.current_level.level_description}
              </Text> */}
              <View className="mt-2 w-full rounded-xl bg-neutral-50 p-3">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-neutral-600">
                    레벨 점수
                  </Text>
                  <Text className="text-sm font-bold text-primary">
                    {/* --- [수정 2] --- */}
                    {/* null일 경우 0으로 표시 */}
                    {stats.current_level.level_score || 0}/100
                  </Text>
                </View>
                <View className="h-2 overflow-hidden rounded-full bg-neutral-200">
                  <View
                    className="h-full rounded-full bg-primary"
                    // [수정 2] null일 경우 0%로 설정
                    style={{
                      width: `${stats.current_level.level_score || 0}%`,
                    }}
                  />
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
                {Math.floor(stats.total_time_spent_minutes / 60)}
              </Text>
              <Text className="text-xs font-semibold text-neutral-400">
                시간 {stats.total_time_spent_minutes % 60}분
              </Text>
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
                  {stats.streak.weekly_total_minutes}분
                </Text>
              </View>
            </View>

            <View
              className="flex-row items-end justify-between gap-2"
              style={{ height: 120 }}
            >
              {/* weeklyActivity 배열은 이제 [월, 화, 수 ... 일] 순서가 보장됨 */}
              {weeklyActivity.map((minutes, index) => {
                const barHeight =
                  maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
                const isToday = index === todayIndex;

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
