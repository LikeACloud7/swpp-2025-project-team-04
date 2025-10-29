import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Chip } from './Chip';

type ChipSelectorGroupProps = {
  title: string;
  chips: readonly string[];
  onSelectionChange?: (selected: string | null) => void;
};

export function ChipSelectorGroup({
  title,
  chips,
  onSelectionChange,
}: ChipSelectorGroupProps) {
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  useEffect(() => {
    onSelectionChange?.(selectedChip);
  }, [onSelectionChange, selectedChip]);

  const selectChip = (chip: string) => {
    setSelectedChip((prev) => (prev === chip ? null : chip));
  };

  const isScrollable = chips.length > 3;

  const containerStyles = useMemo(
    () => ({
      paddingVertical: 8,
      paddingHorizontal: isScrollable ? 4 : 0,
      alignItems: 'center' as const,
    }),
    [isScrollable],
  );

  return (
    <View className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="mb-3 text-lg font-bold text-slate-900">{title}</Text>
      {isScrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            ...containerStyles,
            paddingRight: 12,
          }}
          className="ml-1"
        >
          {chips.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              selected={selectedChip === chip}
              onPress={() => selectChip(chip)}
            />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-row" style={containerStyles}>
          {chips.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              selected={selectedChip === chip}
              onPress={() => selectChip(chip)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
