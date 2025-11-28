import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ProgressBarProps = {
  currentStep: number;
  totalPages: number;
};

export default function ProgressBar({
  currentStep,
  totalPages,
}: ProgressBarProps) {
  const progress = (currentStep / totalPages) * 100;

  return (
    <View className="mb-6">
      <View className="mb-2">
        <View className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-sm">
          <View
            className="h-full rounded-full overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <LinearGradient
              colors={['#0EA5E9', '#38BDF8'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-full"
            />
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-[13px] font-bold text-slate-500">
          {currentStep} / {totalPages}
        </Text>
        <Text className="text-[13px] font-bold text-slate-500">
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
}
