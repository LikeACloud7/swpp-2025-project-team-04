import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type NavButtonsProps = {
  onNext: () => void;
  onBack?: () => void;
  nextLabel: string;
  backLabel?: string;
  canProceed?: boolean;
  showBackButton?: boolean;
  hideNextButton?: boolean;
};

export default function NavButtons({
  onNext,
  onBack,
  nextLabel,
  backLabel = '이전',
  canProceed = true,
  showBackButton = false,
  hideNextButton = false,
}: NavButtonsProps) {
  return (
    <View
      className="flex-row gap-3 px-6 py-4 border-t border-slate-200"
      style={{ backgroundColor: '#EBF4FB' }}
    >
      {showBackButton && onBack && (
        <TouchableOpacity
          className="flex-1 overflow-hidden rounded-2xl"
          onPress={onBack}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-center bg-white border border-slate-300 px-4 py-4 rounded-2xl shadow-sm">
            <Ionicons name="chevron-back" size={20} color="#64748b" />
            <Text className="text-[16px] text-slate-700 font-bold ml-1">
              {backLabel}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {!hideNextButton && (
        <TouchableOpacity
          className={`overflow-hidden rounded-2xl shadow-md ${!showBackButton ? 'flex-[2]' : 'flex-1'} ${!canProceed ? 'opacity-40' : ''}`}
          onPress={onNext}
          disabled={!canProceed}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={
              canProceed
                ? (['#0EA5E9', '#38BDF8'] as const)
                : (['#93C5FD', '#BAE6FD'] as const)
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center px-5 py-4"
          >
            <Text className="text-[17px] text-white font-bold">
              {nextLabel}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#fff"
              style={{ marginLeft: 4 }}
            />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Empty space when next button is hidden */}
      {hideNextButton && <View className="flex-1" />}
    </View>
  );
}
