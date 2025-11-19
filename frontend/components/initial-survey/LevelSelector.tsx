import { View, Text, TouchableOpacity } from 'react-native';

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
    <View className="mb-8 py-4">
      <Text className="text-[28px] font-bold text-gray-900 mb-4 text-center leading-[36px]">
        영어 듣기 실력은 어느 정도인가요?
      </Text>
      <Text className="text-base text-gray-500 mb-10 text-center leading-[24px] px-4">
        가장 정확하다고 생각하는 레벨을 하나 선택해 주세요.
      </Text>
      <View className="gap-4">
        {levels.map((level) => {
          const isSelected = selectedLevel === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              className={`p-4 rounded-2xl items-center shadow-sm ${
                isSelected
                  ? 'bg-[#6FA4D7] border-2 border-[#6FA4D7]'
                  : 'bg-white border-2 border-gray-200'
              }`}
              onPress={() => onSelect(level.id)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-[18px] font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}
              >
                {level.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
