import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

export default function StatsScreen() {
  // Mock data
  const stats = {
    daysStudied: 9,
    totalStudyTime: 92,
    lessonsCompleted: 12,
    vocabularyLearned: 0,
    listeningHours: 0,
    weeklyActivity: [9, 10, 7, 0, 6, 0, 0],
    skillProgress: {
      listening: 0,
      speaking: 0,
      vocabulary: 0,
      comprehension: 0,
    },
  };

  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-gradient-to-br from-primary to-sky-600 px-6 pb-6 pt-16">
          <Text className="mb-6 text-2xl font-black text-neutral-900">
            통계
          </Text>
          <View className="mb-4 rounded-2xl bg-white/95 px-6 py-5 shadow-sm">
            <View className="items-center">
              <Text className="mb-1 text-sm font-semibold text-neutral-600">
                총 학습일
              </Text>
              <Text className="text-4xl font-black text-neutral-900">
                {stats.daysStudied}일
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 items-center rounded-xl bg-white/95 p-4">
              <Text className="text-xs font-semibold text-neutral-600">
                총 학습 시간
              </Text>
              <Text className="text-2xl font-black text-neutral-900">
                {stats.totalStudyTime}분
              </Text>
            </View>

            <View className="flex-1 items-center rounded-xl bg-white/95 p-4">
              <Text className="text-xs font-semibold text-neutral-600">
                완료한 레슨
              </Text>
              <Text className="text-2xl font-black text-neutral-900">
                {stats.lessonsCompleted}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5 pt-4">
          <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-neutral-900">
                주간 활동
              </Text>
              <Text className="text-sm font-semibold text-primary">
                이번 주
              </Text>
            </View>

            <View className="flex-row justify-between">
              {stats.weeklyActivity.map((minutes, index) => (
                <View key={index} className="flex-1 items-center">
                  <Text className="mb-2 text-xs font-semibold text-neutral-400">
                    {weekDays[index]}
                  </Text>
                  <Text className="text-sm font-bold text-neutral-900">
                    {minutes}분
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-2xl bg-white p-6 shadow-sm">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-neutral-900">
                나의 배지
              </Text>
              <Text className="text-sm font-semibold text-neutral-500">
                0 / 10
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {[
                { name: 'a', locked: true },
                { name: 'b', locked: true },
                { name: 'c', locked: true },
                { name: 'd', locked: true },
                { name: 'e', locked: true },
                { name: 'f', locked: true },
              ].map((badge, index) => (
                <View key={index} className="mb-4 w-[30%] items-center">
                  <View
                    className={`mb-2 h-16 w-16 items-center justify-center rounded-2xl ${
                      badge.locked
                        ? 'bg-neutral-100'
                        : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    }`}
                  >
                    <Text
                      className="text-3xl"
                      style={{ opacity: badge.locked ? 0.3 : 1 }}
                    ></Text>
                  </View>
                  <Text
                    className={`text-center text-xs font-semibold ${
                      badge.locked ? 'text-neutral-400' : 'text-neutral-700'
                    }`}
                  >
                    {badge.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
