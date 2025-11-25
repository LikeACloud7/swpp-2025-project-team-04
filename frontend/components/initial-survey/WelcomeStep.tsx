import { View, Text } from 'react-native';

type ContentSection = {
  heading?: string;
  content: string;
  highlight?: string;
};

type WelcomeStepProps = {
  title: string;
  subtitle: string;
  sections: ContentSection[];
};

export default function WelcomeStep({
  title,
  subtitle,
  sections,
}: WelcomeStepProps) {
  return (
    <View className="py-8">
      <Text className="text-[36px] font-extrabold text-sky-900 mb-4 text-center leading-[44px]">
        {title}
      </Text>
      <Text className="text-lg text-sky-700 mb-6 text-center leading-[28px] px-2">
        {subtitle}
      </Text>

      <View className="bg-white p-8 rounded-3xl shadow-lg border border-sky-100">
        {sections.map((section, index) => (
          <View key={index} className={index > 0 ? 'mt-8' : ''}>
            {section.heading && (
              <Text className="text-[22px] font-bold text-slate-900 mb-5 leading-[30px]">
                {section.heading}
              </Text>
            )}
            <Text className="text-[16px] text-slate-600 leading-[26px] mb-5">
              {section.content}
            </Text>
            {section.highlight && (
              <View className="bg-gradient-to-r from-sky-50 to-cyan-50 p-5 rounded-xl mt-2 border border-sky-200" style={{ backgroundColor: '#F0F9FF' }}>
                <Text className="text-[18px] font-semibold text-sky-700 leading-[28px] text-center">
                  {section.highlight}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
