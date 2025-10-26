// components/Slider.tsx
import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress } from 'react-native-track-player';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function AudioSlider() {
  const { position, duration } = useProgress(250);

  return (
    <View className="mt-1">
      <Slider
        value={position}
        minimumValue={0}
        maximumValue={duration}
        onSlidingComplete={async (value) => {
          await TrackPlayer.seekTo(value);
        }}
        minimumTrackTintColor="#6FA4D7"
        maximumTrackTintColor="#dbeafe"
        thumbTintColor="#3b82f6"
      />
      <View className="mt-2 flex-row justify-between">
        <Text className="text-xs font-semibold text-slate-500">
          {formatTime(position)}
        </Text>
        <Text className="text-xs font-semibold text-slate-500">
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}
