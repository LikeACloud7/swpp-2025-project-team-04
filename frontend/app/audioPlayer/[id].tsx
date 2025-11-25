import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Text, View, Modal, Pressable, BackHandler } from 'react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AudioGenerationResponse } from '@/api/audio';
import PlayerControls from '@/components/audio/PlayerControls';
import Script from '@/components/audio/Script';
import AudioSlider from '@/components/audio/AudioSlider';
import { LinearGradient } from 'expo-linear-gradient';
import { useBehaviorLogs } from '@/hooks/useBehaviorLogs';

export default function AudioPlayer() {
  const router = useRouter();

  const qc = useQueryClient();
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : (idParam ?? null);
  const data = id
    ? (qc.getQueryData(['audio', id]) as AudioGenerationResponse | undefined)
    : undefined;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { behaviorLogs, incrementLog } = useBehaviorLogs();

  const togglePlayback = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
      setIsPlaying(false);
      incrementLog('pauseCount'); // 일시정지 카운트
    } else {
      await TrackPlayer.play();
      setIsPlaying(true);
    }
  };

  const stopAndCleanup = useCallback(async () => {
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch {}
  }, []);

  const endSessionWithFeedback = useCallback(async () => {
    await stopAndCleanup();

    // 행동 로그와 generated_content_id를 피드백 페이지로 전달
    const params = {
      generated_content_id: data?.generated_content_id?.toString() ?? '0',
      pause_cnt: behaviorLogs.pauseCount.toString(),
      rewind_cnt: behaviorLogs.rewindCount.toString(),
      vocab_lookup_cnt: behaviorLogs.vocabLookupCount.toString(),
      vocab_save_cnt: behaviorLogs.vocabSaveCount.toString(),
    };

    router.replace({ pathname: '/feedback', params });
  }, [router, stopAndCleanup, data, behaviorLogs]);

  const handleExitWithoutFeedback = async () => {
    await stopAndCleanup();
    router.replace('/');
  };

  // ✅ 마운트 시 자동 재생
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await TrackPlayer.play();
        if (mounted) setIsPlaying(true);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 컴포넌트 상단에
  const { position, duration } = useProgress(100);

  const didFinishRef = useRef(false);

  // ✅ 트랙 재생 완료 시(끝에 근접) 피드백 페이지 이동 - useProgress 버전
  useEffect(() => {
    if (didFinishRef.current) return;
    if (!duration || duration <= 0) return;

    // 끝으로부터 epsilon(여유) 안으로 들어오면 완료 처리
    const EPSILON = 0.1; // 초 단위 여유 (원하는 값으로 조절)
    if (position >= duration - EPSILON) {
      didFinishRef.current = true;
      (async () => {
        await endSessionWithFeedback();
      })();
    }
  }, [position, duration, endSessionWithFeedback]);

  // 트랙/화면 재진입 시 한 번 더 테스트해야 한다면 필요에 따라 리셋
  useEffect(() => {
    didFinishRef.current = false;
    return () => {
      // 언마운트 시 정리
      didFinishRef.current = true;
    };
  }, []);

  // 뒤로가기 눌렀을 때 모달
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!data) return false;
      if (isModalVisible) {
        setIsModalVisible(false);
        return true;
      }
      setIsModalVisible(true);
      return true;
    });
    return () => sub.remove();
  }, [data, isModalVisible]);

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EBF4FB]">
        <Ionicons name="alert-circle" size={64} color="#0EA5E9" />
        <Text className="mt-3 text-slate-600 text-base font-semibold">
          오디오 데이터를 불러오지 못했어요.
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#0C4A6E', '#0369A1', '#7DB7E8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      {/* 스크립트 */}
      <Script
        generatedContentId={data.generated_content_id}
        scripts={data.sentences}
        onVocabLookup={() => incrementLog('vocabLookupCount')}
        onVocabSave={() => incrementLog('vocabSaveCount')}
        onRewind={() => incrementLog('rewindCount')}
      />

      {/* 슬라이더 */}
      <AudioSlider />

      {/* 컨트롤 */}
      <PlayerControls isPlaying={isPlaying} onTogglePlay={togglePlayback} />

      {/* 종료 모달 */}
      {isModalVisible && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/40">
            <Pressable
              onPress={() => setIsModalVisible(false)}
              className="absolute inset-0"
            />
            <View className="w-80 rounded-2xl bg-white p-5">
              <View className="flex-row items-center">
                <View className="mr-3 rounded-full bg-sky-100 p-2">
                  <Ionicons
                    name="warning-outline"
                    size={20}
                    color="#f97316" // 주황 느낌 경고
                  />
                </View>
                <Text className="text-lg font-bold text-slate-900">
                  학습을 종료할까요?
                </Text>
              </View>

              <Text className="mt-3 text-slate-600">
                지금 화면을 떠나면 이번 학습의 진행 상태와 행동 기록이 저장되지
                않습니다. 그래도 종료할까요?
              </Text>

              <View className="mt-5 flex-row justify-end gap-2">
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  className="rounded-full bg-slate-100 px-4 py-2 active:opacity-80"
                >
                  <Text className="font-semibold text-slate-700">
                    계속 학습
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleExitWithoutFeedback}
                  className="rounded-full bg-red-500 px-4 py-2 active:opacity-90"
                >
                  <Text className="font-semibold text-white">
                    종료하고 나가기
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
}
