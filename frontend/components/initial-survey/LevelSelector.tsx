import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export type Level = {
  id: string;
  title: string;
};

type LevelSelectorProps = {
  levels: Level[];
  selectedLevel: string;
  onSelect: (levelId: string) => void;
};

export default function LevelSelector({
  levels,
  selectedLevel,
  onSelect,
}: LevelSelectorProps) {
  return (
    <View>
      <View className="mb-6">
        <Text className="text-[32px] font-black text-slate-900 mb-3 text-center leading-[40px] tracking-tight">
          영어 듣기 실력은{'\n'}어느 정도인가요?
        </Text>
        <Text className="text-[15px] text-slate-600 mb-2 text-center leading-[22px] px-4">
          가장 정확하다고 생각하는 레벨을 선택해 주세요
        </Text>
      </View>

      <View className="gap-3">
        {levels.map((level) => {
          const isSelected = selectedLevel === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              onPress={() => onSelect(level.id)}
              activeOpacity={0.7}
              className="overflow-hidden rounded-2xl"
            >
              {isSelected ? (
                <LinearGradient
                  colors={['#0EA5E9', '#38BDF8'] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center justify-between px-5 py-4 shadow-md"
                >
                  <Text className="text-[17px] font-bold text-white flex-1">
                    {level.title}
                  </Text>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </LinearGradient>
              ) : (
                <View className="flex-row items-center justify-between px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <Text className="text-[17px] font-semibold text-slate-700 flex-1">
                    {level.title}
                  </Text>
                  <View className="w-6 h-6 rounded-full border-2 border-slate-300" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
