import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import TrackPlayer, { Track } from 'react-native-track-player';

import AudioScreen, { ScriptLine } from '../components/audio/script';

// 2. 테스트용 스크립트 데이터 (AudioScreen에 전달)
const testScripts: ScriptLine[] = [
  { id: 0, time: 2.5, text: '(Music Intro...)' },
  { id: 1, time: 5.0, text: 'This is the first line.' },
  { id: 2, time: 8.2, text: 'The highlighting should follow.' },
  { id: 3, time: 11.5, text: 'Tap a line to seek.' },
  { id: 4, time: 15.0, text: 'End of test.' },
];

// 3. 테스트용 트랙 (RNTP에 로드)
const testTrack: Track = {
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  title: 'Test Track',
  artist: 'Test Artist',
};

// RNTP 초기 설정 함수
const setupPlayer = async () => {
  try {
    // 플레이어 설정 (OS와 통신)
    await TrackPlayer.setupPlayer();

    // // 플레이어 옵션 설정 (OS 제어센터/알림 동작)
    // await TrackPlayer.updateOptions({
    //   capabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],
    // });

    // 큐에 트랙 추가 (지금은 더미)
    await TrackPlayer.add(testTrack);
  } catch (error) {
    console.error('Player setup error', error);
  }
};

export default function AudioPlayer() {
  const [isPlayerReady, setIsPlayerReady] = useState(false); // 플레이어 준비 상태

  // 마운트 시 플레이어 설정
  useEffect(() => {
    setupPlayer().then(() => {
      setIsPlayerReady(true);
    });
  }, []);

  // 플레이/일시정지 함수
  const onPlay = () => TrackPlayer.play();
  const onPause = () => TrackPlayer.pause();

  // 플레이어 준비가 안 됐으면 로딩 표시
  if (!isPlayerReady) {
    return <Text style={{ color: 'white' }}>Loading Player...</Text>;
  }

  // 렌더링
  return (
    <View style={{ flex: 1 }}>
      {/* 가사 화면 컴포넌트 */}
      <AudioScreen scripts={testScripts} />

      {/* 재생, 일시정지 버튼 */}
      <View style={{ padding: 20 }}>
        <Button title="Play" onPress={onPlay} />
        <Button title="Pause" onPress={onPause} />
      </View>
    </View>
  );
}
