import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress } from 'react-native-track-player';

function formatTime(seconds: number) {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function AudioSlider() {
  const { position, duration } = useProgress(100);

  return (
    <View className="px-4 pb-3">
      {/* 슬라이더 */}
      <Slider
        style={{ width: '100%', height: 36 }}
        value={position}
        minimumValue={0}
        maximumValue={duration || 0}
        onSlidingComplete={async (value) => {
          await TrackPlayer.seekTo(value);
        }}
        minimumTrackTintColor="rgba(255,255,255,0.95)"
        maximumTrackTintColor="rgba(255,255,255,0.28)"
        thumbTintColor="rgba(255,255,255,0.98)"
        disabled={!duration}
      />

      {/* 시간 (M:S) */}
      <View className="-mt-2 flex-row justify-between px-5">
        <Text className="font-semibold text-white/70">
          {formatTime(position)}
        </Text>
        <Text className="font-semibold text-white/70">
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}
