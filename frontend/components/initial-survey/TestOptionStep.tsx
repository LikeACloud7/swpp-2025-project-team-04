import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface TestOptionStepProps {
  onSelect: (skipTest: boolean) => void;
}

export default function TestOptionStep({ onSelect }: TestOptionStepProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (skipTest: boolean) => {
    setSelected(skipTest);
    onSelect(skipTest);
  };

  return (
    <View className="flex-1 justify-center px-6 pb-8">
      <View className="items-center mb-8">
        <Text className="text-3xl font-bold text-[#2E5077] mb-4 text-center">
          듣기 테스트를 진행할까요?
        </Text>
        <Text className="text-base text-[#4A5568] text-center leading-6">
          더 정확한 레벨 측정을 위해 짧은 듣기 테스트를 권장합니다.{'\n'}
          (약 5분 소요)
        </Text>
      </View>

      <View className="w-full gap-4">
        <TouchableOpacity
          onPress={() => handleSelect(false)}
          className={`w-full py-4 rounded-2xl shadow-sm active:opacity-80 ${
            selected === false
              ? 'bg-[#6FA4D7] border-2 border-[#6FA4D7]'
              : 'bg-white border-2 border-[#D1D5DB]'
          }`}
        >
          <Text
            className={`text-lg font-semibold text-center ${
              selected === false ? 'text-white' : 'text-[#4A5568]'
            }`}
          >
            테스트 진행하기
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSelect(true)}
          className={`w-full py-4 rounded-2xl shadow-sm active:opacity-80 ${
            selected === true
              ? 'bg-[#6FA4D7] border-2 border-[#6FA4D7]'
              : 'bg-white border-2 border-[#D1D5DB]'
          }`}
        >
          <Text
            className={`text-lg font-semibold text-center ${
              selected === true ? 'text-white' : 'text-[#4A5568]'
            }`}
          >
            건너뛰기
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-sm text-[#718096] mt-6 text-center">
        테스트를 건너뛰면 선택한 레벨을 기준으로 시작합니다.
      </Text>
    </View>
  );
}
