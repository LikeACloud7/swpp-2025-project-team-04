import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AudioScreen from '@/components/audio/script';
import AudioSlider from '@/components/audio/slider';
import { useQueryClient } from '@tanstack/react-query';
import { AudioGenerationResponse } from '@/api/audio';

export default function AudioPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const router = useRouter();

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
  const headerTitle = data.title?.trim() || '학습 오디오';

  const togglePlayback = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
      setIsPlaying(false);
    } else {
      await TrackPlayer.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    TrackPlayer.play().then(() => setIsPlaying(true));
    return () => {
      TrackPlayer.stop();
      setIsPlaying(false);
    };
  }, []);

  const handleFinishSession = async () => {
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch (e) {
      // noop: stopping/resetting can throw if player already reset
    } finally {
      setIsPlaying(false);
      router.push('/feedback');
    }
  };

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <View className="flex-1 px-5 pt-6">
        <AudioScreen scripts={data.sentences} />
      </View>

      <View className="px-5 pb-10">
        <View className="relative rounded-2xl bg-white px-5 py-6 shadow-lg shadow-sky-200/60">
          <View className="mb-4">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-primary/80">
              오늘의 맞춤 세션
            </Text>
            <Text
              className="mt-1 text-xl font-black text-slate-900"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {headerTitle}
            </Text>
          </View>

          <AudioSlider />

          <View className="mt-6 items-center justify-center">
            <TouchableOpacity
              onPress={togglePlayback}
              className={`h-16 w-16 items-center justify-center rounded-full ${
                isPlaying ? 'bg-slate-200' : 'bg-primary'
              } active:opacity-80`}
            >
              {isPlaying ? (
                <Ionicons name="pause" size={34} color="#1f2937" />
              ) : (
                <Ionicons
                  name="play"
                  size={34}
                  color="#ffffff"
                  style={{ marginLeft: 2 }}
                />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleFinishSession}
            className="absolute bottom-5 right-5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 active:opacity-80"
          >
            <Text className="text-xs font-semibold text-primary">
              학습 끝내기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
