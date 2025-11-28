import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
    <View>
      <View className="mb-6">
        <Text className="text-[40px] font-black text-slate-900 mb-3 text-center leading-[48px] tracking-tight">
          {title}
        </Text>
        <Text className="text-base text-slate-600 mb-2 text-center leading-[24px] px-4">
          {subtitle}
        </Text>
      </View>

      <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {sections.map((section, index) => (
          <View key={index}>
            <View className="p-6">
              {section.heading && (
                <View className="flex-row items-center mb-4">
                  <LinearGradient
                    colors={['#0EA5E9', '#38BDF8'] as const}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="mr-3 h-6 w-1.5 rounded-full"
                  />
                  <Text className="text-xl font-extrabold text-slate-900 leading-[28px] tracking-tight">
                    {section.heading}
                  </Text>
                </View>
              )}
              <Text className="text-[15px] text-slate-600 leading-[24px]">
                {section.content}
              </Text>
              {section.highlight && (
                <View className="mt-4 overflow-hidden rounded-2xl">
                  <LinearGradient
                    colors={['#E0F2FE', '#F0F9FF'] as const}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-4 border border-sky-200"
                  >
                    <Text className="text-base font-bold text-sky-700 leading-[24px] text-center">
                      {section.highlight}
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>
            {index < sections.length - 1 && (
              <View className="h-[1px] bg-slate-100 mx-6" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
