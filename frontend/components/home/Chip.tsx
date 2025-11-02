import { memo } from 'react';
import { Pressable, Text } from 'react-native';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: (label: string) => void;
};

// use memo to prevent unnecessary re-renders
export const Chip = memo(function Chip({
  label,
  selected = false,
  onPress,
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        onPress?.(label);
      }}
      className={`mr-3 flex-row items-center rounded-full border-2 px-5 py-3 shadow-sm ${selected ? 'border-primary bg-primary' : 'border-gray-200 bg-white'}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Text
        className={`text-[15px] font-semibold ${selected ? 'text-white' : 'text-gray-600'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
});
