import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type TopicCategory = {
  category: string;
  topics: Array<{ id: string; label: string; emoji: string }>;
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
    <View className="py-4 mt-2">
      <View className="mb-8">
        <Text className="text-[32px] font-black text-slate-900 mb-3 text-center leading-[40px] tracking-tight">
          관심 있는 주제를{'\n'}선택해주세요
        </Text>
        <Text className="text-[15px] text-slate-600 mb-2 text-center leading-[22px]">
          최대 {maxSelections}개까지 선택 가능
        </Text>
      </View>

      <View className="mb-6 overflow-hidden rounded-2xl">
        <LinearGradient
          colors={
            selectedTopics.length === maxSelections
              ? (['#0EA5E9', '#38BDF8'] as const)
              : (['#F1F5F9', '#F8FAFC'] as const)
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-5 py-3 border"
          style={{
            borderColor:
              selectedTopics.length === maxSelections
                ? 'transparent'
                : '#E2E8F0',
          }}
        >
          <Text
            className={`text-[15px] font-bold text-center ${
              selectedTopics.length === maxSelections
                ? 'text-white'
                : 'text-slate-600'
            }`}
          >
            {selectedTopics.length} / {maxSelections} 선택됨
          </Text>
        </LinearGradient>
      </View>

      {categories.map((categoryData, index) => (
        <View key={index} className="mb-6">
          <View className="flex-row items-center mb-3">
            <LinearGradient
              colors={['#0EA5E9', '#38BDF8'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="mr-2 h-5 w-1 rounded-full"
            />
            <Text className="text-[17px] font-extrabold text-slate-900 tracking-tight">
              {categoryData.category}
            </Text>
          </View>

          <View className="flex-row flex-wrap">
            {categoryData.topics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id);
              const isDisabled =
                !isSelected && selectedTopics.length >= maxSelections;

              return (
                <View key={topic.id} className="mb-2.5 mr-2.5">
                  <TouchableOpacity
                    onPress={() => onToggle(topic.id)}
                    activeOpacity={0.7}
                    disabled={isDisabled}
                    className="overflow-hidden rounded-2xl"
                  >
                    <LinearGradient
                      colors={
                        isSelected
                          ? (['#0EA5E9', '#38BDF8'] as const)
                          : isDisabled
                            ? (['#E5E7EB', '#F3F4F6'] as const)
                            : (['#F8FAFC', '#EEF2F7'] as const)
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className={`px-4 py-2.5 border shadow-sm ${
                        isSelected ? 'border-transparent' : 'border-slate-200'
                      }`}
                    >
                      <View className="flex-row items-center">
                        <Text className="text-[16px] mr-1.5">
                          {topic.emoji}
                        </Text>
                        <Text
                          className={`text-[14px] font-semibold ${
                            isSelected
                              ? 'text-white'
                              : isDisabled
                                ? 'text-slate-400'
                                : 'text-slate-700'
                          }`}
                        >
                          {topic.label}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
