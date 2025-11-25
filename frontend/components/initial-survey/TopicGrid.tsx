import { View, Text, TouchableOpacity } from 'react-native';

export type TopicCategory = {
  category: string;
  topics: Array<{ id: string; label: string }>;
};

type TopicGridProps = {
  categories: TopicCategory[];
  selectedTopics: string[];
  onToggle: (topicId: string) => void;
  maxSelections: number;
};

export default function TopicGrid({
  categories,
  selectedTopics,
  onToggle,
  maxSelections,
}: TopicGridProps) {
  return (
    <View className="mb-8 py-4">
      <Text className="text-[28px] font-extrabold text-sky-900 mb-3 text-center leading-[36px]">
        가장 관심 있는 주제를 선택해주세요
      </Text>
      <Text className="text-base text-sky-700 mb-10 text-center">
        최대 {maxSelections}개까지 선택할 수 있습니다
      </Text>

      {categories.map((categoryData, index) => (
        <View key={index} className="mb-8">
          <Text className="text-[18px] font-bold text-slate-900 mb-4 ml-1">
            {categoryData.category}
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {categoryData.topics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id);
              return (
                <TouchableOpacity
                  key={topic.id}
                  className={`py-3 px-5 rounded-full shadow-md ${
                    isSelected
                      ? 'bg-sky-500 border-2 border-sky-600'
                      : 'bg-white border-2 border-sky-200'
                  }`}
                  onPress={() => onToggle(topic.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-[15px] font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}
                  >
                    {topic.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <View className="bg-white px-6 py-4 rounded-3xl shadow-lg border border-sky-100 mt-4">
        <Text className="text-[16px] font-bold text-sky-600 text-center">
          {selectedTopics.length} / {maxSelections} 선택됨
        </Text>
      </View>
    </View>
  );
}
