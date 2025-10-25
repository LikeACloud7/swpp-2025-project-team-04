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
      <Text className="text-[36px] font-bold text-gray-900 mb-4 text-center leading-[44px]">
        {title}
      </Text>
      <Text className="text-lg text-gray-500 mb-4 text-center leading-[28px] px-2">
        {subtitle}
      </Text>

      <View className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {sections.map((section, index) => (
          <View key={index} className={index > 0 ? 'mt-8' : ''}>
            {section.heading && (
              <Text className="text-[22px] font-bold text-gray-900 mb-5 leading-[30px]">
                {section.heading}
              </Text>
            )}
            <Text className="text-[16px] text-gray-600 leading-[26px] mb-5">
              {section.content}
            </Text>
            {section.highlight && (
              <View className="bg-[#EBF4FB] p-5 rounded-xl mt-2">
                <Text className="text-[18px] font-semibold text-[#6FA4D7] leading-[28px] text-center">
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
