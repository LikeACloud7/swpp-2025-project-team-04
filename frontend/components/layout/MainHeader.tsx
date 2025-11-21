import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type MainHeaderProps = {
  title: string;
};

export default function MainHeader({ title }: MainHeaderProps) {
  const insets = useSafeAreaInsets(); // 안전 영역 패딩 얻기
  const router = useRouter();

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: '#ffffff' }}>
      <View className="flex-row items-center justify-between border-b border-slate-200 px-6 pb-3 pt-2">
        <Text className="text-xl font-extrabold text-slate-900">{title}</Text>
        <Pressable
          onPress={() => router.push('/profile')}
          className="h-9 w-9 items-center justify-center rounded-full bg-primary active:bg-primary/80"
        >
          <Ionicons name="person" size={20} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}
