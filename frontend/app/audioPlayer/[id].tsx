import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';

import AudioScreen from '../../components/audio/script';
import AudioSlider from '@/components/audio/slider';
import { useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AudioGenerationResponse } from '@/api/audio';

export default function AudioPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const data = qc.getQueryData(['audio', id]) as
    | AudioGenerationResponse
    | undefined;

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Ionicons name="alert-circle" size={64} color="white" />
      </View>
    );
  }

  const [isPlaying, setIsPlaying] = useState(false);

  // 상태에 따라 토글
  const togglePlayback = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
      setIsPlaying(false);
      console.log('Playback paused');
    } else {
      await TrackPlayer.play();
      setIsPlaying(true);
      console.log('Playback started');
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* 가사 화면 */}
      <AudioScreen scripts={data.sentences} />

      <AudioSlider />

      {/* 하단 플레이버튼 */}
      <View className="items-center justify-center p-5">
        <TouchableOpacity
          onPress={togglePlayback}
          className={`w-16 h-16 rounded-full items-center justify-center
            ${isPlaying ? 'bg-neutral-700' : 'bg-emerald-500'} active:opacity-80`}
        >
          {isPlaying ? (
            <Ionicons name="pause" size={36} color="white" />
          ) : (
            <Ionicons
              name="play"
              size={36}
              color="white"
              style={{ marginLeft: 2 }}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
