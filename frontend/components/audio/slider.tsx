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
    <View className="px-4 mt-2">
      <Slider
        value={position}
        minimumValue={0}
        maximumValue={duration}
        onSlidingComplete={async (value) => {
          await TrackPlayer.seekTo(value);
        }}
        minimumTrackTintColor="#ffffff"
        maximumTrackTintColor="#555555"
        thumbTintColor="#ffffff"
      />
      <View className="flex-row justify-between mt-1">
        <Text className="text-xs text-gray-300">{formatTime(position)}</Text>
        <Text className="text-xs text-gray-300">{formatTime(duration)}</Text>
      </View>
    </View>
  );
}
