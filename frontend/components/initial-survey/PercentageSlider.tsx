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
        <Text className="text-[24px] font-extrabold text-sky-900 text-center mb-16 leading-[32px] px-2">
          들은 내용 중 몇 %를 이해했는지{'\n'}솔직하게 평가해 주세요.
        </Text>

        <View className="bg-white p-8 rounded-3xl shadow-lg border border-sky-100">
          <View className="items-center mb-6">
            <Text className="text-[56px] font-extrabold text-sky-600 mb-2">
              {value}%
            </Text>
            <Text className="text-sm text-sky-700 font-semibold">이해도</Text>
          </View>

          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={100}
            step={10}
            value={value}
            onValueChange={onChange}
            minimumTrackTintColor="#0EA5E9"
            maximumTrackTintColor="#E0F2FE"
            thumbTintColor="#0EA5E9"
          />

          <View className="flex-row justify-between mt-3 px-1">
            <Text className="text-xs text-sky-600 font-semibold">0%</Text>
            <Text className="text-xs text-sky-600 font-semibold">100%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
