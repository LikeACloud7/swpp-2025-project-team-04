import { View, Text } from 'react-native';

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
    <View className="mb-10">
      <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-[#6FA4D7] rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}
