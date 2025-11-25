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
      <View className="h-1.5 bg-sky-200 rounded-full overflow-hidden shadow-sm">
        <View
          className="h-full bg-sky-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}
