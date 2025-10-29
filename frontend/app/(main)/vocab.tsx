import { ScrollView, Text, View } from 'react-native';
const MOCK_VOCAB = [
  {
    id: '1',
    word: 'meticulous',
    meaning: '꼼꼼한, 세심한',
    partOfSpeech: '형용사',
    theme: '업무 발표',
    example:
      'Our project manager is meticulous about checking every requirement before launch.',
    note: '회의에서 강조할 때 자주 사용되는 단어',
    mastery: 70,
  },
  {
    id: '2',
    word: 'break down',
    meaning: '분석하다, 세분화하다',
    partOfSpeech: '동사구',
    theme: '업무 회의',
    example:
      "Let's break down the onboarding flow into three clear steps for the new hires.",
    note: '복합 동사 표현, 회의록에서 자주 등장',
    mastery: 55,
  },
  {
    id: '3',
    word: 'resilient',
    meaning: '회복력이 있는, 탄력적인',
    partOfSpeech: '형용사',
    theme: '자기 개발',
    example:
      'Staying resilient after a setback helps the team regain confidence quickly.',
    note: '자기계발 관련 콘텐츠에서 자주 사용',
    mastery: 80,
  },
  {
    id: '4',
    word: 'streamline',
    meaning: '효율화하다, 간소화하다',
    partOfSpeech: '동사',
    theme: '업무 자동화',
    example:
      'We streamlined our customer support process with a single ticketing inbox.',
    note: '업무 효율화 회의에서 등장',
    mastery: 40,
  },
];
export default function VocabScreen() {
  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-16">
          {MOCK_VOCAB.map((item) => (
            <View
              key={item.id}
              className="mb-4 rounded-2xl bg-white p-5 shadow-sm"
            >
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-black text-neutral-900">
                    {item.word}
                  </Text>
                  <Text className="mt-1 text-sm font-semibold text-sky-500">
                    {item.partOfSpeech} · {item.theme}
                  </Text>
                </View>
                <View className="ml-3 items-center">
                  <Text className="text-xs font-semibold text-neutral-400">
                    숙련도
                  </Text>
                  <Text className="text-lg font-black text-primary">
                    {item.mastery}%
                  </Text>
                </View>
              </View>
              <Text className="text-base font-semibold text-neutral-800">
                {item.meaning}
              </Text>
              <Text className="mt-2 text-sm leading-5 text-neutral-600">
                {item.example}
              </Text>
              <View className="mt-3 rounded-xl bg-sky-50 px-4 py-2">
                <Text className="text-xs font-semibold text-sky-600">메모</Text>
                <Text className="mt-1 text-xs leading-4 text-sky-700">
                  {item.note}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
