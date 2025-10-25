import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import TrackPlayer, {
  Capability,
  Track,
  State,
  usePlaybackState,
} from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons'; // 아이콘 추가

import AudioScreen, { ScriptLine } from '../components/audio/script';
import AudioSlider from '@/components/audio/slider';

/**
 * 테스트용 스크립트 데이터
 */
const testScripts: ScriptLine[] = [
  { id: 0, start_time: 0, text: 'Sports—what a rush, right?' },
  {
    id: 1,
    start_time: 2.647,
    text: "Whether it's the roar of the crowd or the thrill of competition, nothing beats it.",
  },
  {
    id: 2,
    start_time: 6.85,
    text: 'Do you feel that electric buzz in the air before a big match?',
  },
  { id: 3, start_time: 10.089, text: "It's as if the world holds its breath." },
  { id: 4, start_time: 12.063, text: 'Think about it.' },
  {
    id: 5,
    start_time: 13.154,
    text: 'Players on the field, ready to give their all.',
  },
  {
    id: 6,
    start_time: 16.08,
    text: 'Each one with a story, a dream, a goal to achieve.',
  },
  { id: 7, start_time: 21.083, text: 'And the fans?' },
  { id: 8, start_time: 22.511, text: 'Oh, they live for these moments!' },
  {
    id: 9,
    start_time: 24.857,
    text: 'Every cheer, every groan, every heart-stopping second.',
  },
  {
    id: 10,
    start_time: 29.617,
    text: "It's not just about winning or losing; it's about being a part of something bigger.",
  },
  {
    id: 11,
    start_time: 34.121,
    text: 'A community united in passion and hope.',
  },
  {
    id: 12,
    start_time: 36.791,
    text: "Football, tennis, rugby, or any sport—it's the same magic.",
  },
  {
    id: 13,
    start_time: 41.877,
    text: 'Skills honed through hours of training, sweat, and effort.',
  },
  {
    id: 14,
    start_time: 45.522,
    text: 'The anticipation builds with every passing minute.',
  },
  {
    id: 15,
    start_time: 48.599,
    text: 'And then, that glorious moment when it all pays off.',
  },
  {
    id: 16,
    start_time: 52.244,
    text: 'A spectacular goal, a perfect serve, a winning try.',
  },
  {
    id: 17,
    start_time: 56.97,
    text: 'That is what defines the spirit of sports.',
  },
  {
    id: 18,
    start_time: 59.536,
    text: "It's the dance between effort and exhilaration.",
  },
  {
    id: 19,
    start_time: 62.693,
    text: 'So, next time you watch your favorite team or player, remember this.',
  },
  {
    id: 20,
    start_time: 66.919,
    text: 'Immerse yourself in the thrill of the game.',
  },
  {
    id: 21,
    start_time: 68.986,
    text: 'Feel it, live it, and let it inspire you!',
  },
];

/**
 * 테스트용 트랙
 */
const testTrack: Track = {
  url: require('@/mock/test.mp3'),
  title: 'Test Track',
  artist: 'Test Artist',
};

// const testTrack: Track = {
//   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
//   title: 'Remote Test Track',
//   artist: 'SoundHelix',
// };

/**
 * RNTP 초기화
 */
const setupPlayer = async () => {
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],
  });
  await TrackPlayer.add(testTrack);
};

export default function AudioPlayer() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 플레이어 준비 완료 상태 확인
  useEffect(() => {
    setupPlayer().then(() => setIsPlayerReady(true));
  }, []);

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

  if (!isPlayerReady) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Ionicons name="musical-notes" size={40} color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* 가사 화면 */}
      <AudioScreen scripts={testScripts} />

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
