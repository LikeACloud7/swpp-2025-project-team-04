import { View, Text, TouchableOpacity } from 'react-native';

type NavButtonsProps = {
  onNext: () => void;
  onBack?: () => void;
  nextLabel: string;
  backLabel?: string;
  canProceed?: boolean;
  showBackButton?: boolean;
};

export default function NavButtons({
  onNext,
  onBack,
  nextLabel,
  backLabel = '이전',
  canProceed = true,
  showBackButton = false,
}: NavButtonsProps) {
  return (
    <View className="flex-row gap-4 p-6 pb-10" style={{ backgroundColor: '#F0F9FF' }}>
      {showBackButton && onBack && (
        <TouchableOpacity
          className="flex-1 p-5 rounded-2xl bg-white border-2 border-sky-200 items-center shadow-md"
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text className="text-[16px] text-slate-700 font-bold">
            {backLabel}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        className={`p-5 rounded-2xl bg-sky-500 items-center shadow-lg ${!showBackButton ? 'flex-[2]' : 'flex-1'} ${!canProceed ? 'opacity-40' : ''}`}
        onPress={onNext}
        disabled={!canProceed}
        activeOpacity={0.8}
      >
        <Text className="text-[16px] text-white font-bold">{nextLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
