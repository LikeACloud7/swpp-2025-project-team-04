import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

type PercentageSliderProps = {
  value: number;
  onChange: (value: number) => void;
  fileNumber: number;
};

export default function PercentageSlider({
  value,
  onChange,
  fileNumber,
}: PercentageSliderProps) {
  return (
    <View className="mb-8 py-4">
      <View className="px-2">
        <Text className="text-[24px] font-bold text-gray-900 text-center mb-16 leading-[32px] px-2">
          들은 내용 중 몇 %를 이해했는지{'\n'}솔직하게 평가해 주세요.
        </Text>

        <View className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <View className="items-center mb-6">
            <Text className="text-[56px] font-bold text-[#6FA4D7] mb-2">
              {value}%
            </Text>
            <Text className="text-sm text-gray-400 font-medium">이해도</Text>
          </View>

          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={100}
            step={10}
            value={value}
            onValueChange={onChange}
            minimumTrackTintColor="#6FA4D7"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#6FA4D7"
          />

          <View className="flex-row justify-between mt-3 px-1">
            <Text className="text-xs text-gray-400 font-medium">0%</Text>
            <Text className="text-xs text-gray-400 font-medium">100%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
