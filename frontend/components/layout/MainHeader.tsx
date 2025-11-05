import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MainHeaderProps = {
  title: string;
};

export default function MainHeader({ title }: MainHeaderProps) {
  const insets = useSafeAreaInsets(); // 안전 영역 패딩 얻기

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: '#ffffff' }}>
      <View className="border-b border-slate-200 px-6 pb-3 pt-2">
        <Text className="text-xl font-extrabold text-slate-900">{title}</Text>
      </View>
    </View>
  );
}
