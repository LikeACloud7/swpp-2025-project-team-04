import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PlayerControlsProps = {
  isPlaying: boolean;
  onTogglePlay: () => Promise<void> | void;
};

export default function PlayerControls({
  isPlaying,
  onTogglePlay,
}: PlayerControlsProps) {
  return (
    <View className="items-center pb-10">
      {/* ▶︎ / ❚❚ 재생/일시정지 버튼 (가운데) */}
      <Pressable
        onPress={onTogglePlay}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? '일시정지' : '재생'}
        android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
        className="h-20 w-20 items-center justify-center rounded-full active:opacity-90 bg-white/15"
      >
        {isPlaying ? (
          <Ionicons name="pause" size={40} color="#ffffff" />
        ) : (
          <Ionicons
            name="play"
            size={40}
            color="#ffffff"
            style={{ marginLeft: 2 }}
          />
        )}
      </Pressable>
    </View>
  );
}
