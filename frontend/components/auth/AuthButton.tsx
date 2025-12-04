import React from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';

type AuthButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export default function AuthButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  className = '',
}: AuthButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-2xl py-4 flex-row items-center justify-center ${
        disabled || loading ? 'bg-sky-400/60' : 'bg-sky-500 active:bg-sky-600'
      } ${className}`}
      style={({ pressed }) => ({
        transform: [{ scale: pressed && !(disabled || loading) ? 0.98 : 1 }],
      })}
    >
      {loading ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator color="white" size="small" />
          <Text className="ml-2 text-[15px] font-semibold text-white">
            {title} 중...
          </Text>
        </View>
      ) : (
        <Text className="text-[15px] font-semibold text-white">{title}</Text>
      )}
    </Pressable>
  );
}
