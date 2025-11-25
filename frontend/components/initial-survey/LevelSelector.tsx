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
      <Text className="text-[28px] font-extrabold text-sky-900 mb-4 text-center leading-[36px]">
        영어 듣기 실력은 어느 정도인가요?
      </Text>
      <Text className="text-base text-sky-700 mb-10 text-center leading-[24px] px-4">
        가장 정확하다고 생각하는 레벨을 하나 선택해 주세요.
      </Text>
      <View className="gap-4">
        {levels.map((level) => {
          const isSelected = selectedLevel === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              className={`p-5 rounded-2xl items-center shadow-md ${
                isSelected
                  ? 'bg-sky-500 border-2 border-sky-600'
                  : 'bg-white border-2 border-sky-200'
              }`}
              onPress={() => onSelect(level.id)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-[18px] font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}
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
