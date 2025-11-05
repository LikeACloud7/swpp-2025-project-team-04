import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Text, View, Modal, Pressable, BackHandler } from 'react-native';
import TrackPlayer, { Event, useProgress } from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AudioGenerationResponse } from '@/api/audio';
import PlayerControls from '@/components/audio/PlayerControls';
import Script from '@/components/audio/Script';
import AudioSlider from '@/components/audio/AudioSlider';
import { LinearGradient } from 'expo-linear-gradient';

export default function AudioPlayer() {
  const { id: idParam } = useLocalSearchParams();
  const qc = useQueryClient();
  const router = useRouter();
  const navigation = useNavigation();

  const id = Array.isArray(idParam) ? idParam[0] : (idParam ?? null);
  const data = id
    ? (qc.getQueryData(['audio', id]) as AudioGenerationResponse | undefined)
    : undefined;

  const [isPlaying, setIsPlaying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const togglePlayback = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
      setIsPlaying(false);
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

  const goFeedback = useCallback(async () => {
    await stopAndCleanup();
    router.push('/feedback');
  }, [router, stopAndCleanup]);

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
  const { position, duration } = useProgress(250); // 250ms 간격 (원하는 주기로)

  const didFinishRef = useRef(false);

  // ✅ 트랙 재생 완료 시(끝에 근접) 피드백 페이지 이동 - useProgress 버전
  useEffect(() => {
    if (didFinishRef.current) return;
    if (!duration || duration <= 0) return;

    // 끝으로부터 epsilon(여유) 안으로 들어오면 완료 처리
    const EPSILON = 0.4; // 초 단위 여유 (원하는 값으로 조절)
    if (position >= duration - EPSILON) {
      didFinishRef.current = true;
      (async () => {
        await goFeedback();
      })();
    }
  }, [position, duration, goFeedback]);

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
      if (modalVisible) {
        setModalVisible(false);
        return true;
      }
      setModalVisible(true);
      return true;
    });
    return () => sub.remove();
  }, [data, modalVisible]);

  useEffect(() => {
    const beforeRemove = navigation.addListener('beforeRemove', (e) => {
      if (!data) return;
      if (modalVisible) return;
      e.preventDefault();
      setModalVisible(true);
    });
    return beforeRemove;
  }, [navigation, data, modalVisible]);

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
      {/* 상단 스크립트 */}
      <View className="flex-1 relative">
        <Script
          generatedContentId={data.generated_content_id}
          scripts={data.sentences}
        />
      </View>

      {/* 슬라이더 */}
      <View className="px-4 pb-3">
        <AudioSlider />
      </View>

      {/* 컨트롤 */}
      <PlayerControls
        isPlaying={isPlaying}
        onTogglePlay={togglePlayback}
        onFinish={() => setModalVisible(true)}
      />

      {/* 종료 모달 */}
      <Modal
        transparent
        animationType="fade" // ✅ 기본 fade 사용
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40">
          <Pressable
            onPress={() => setModalVisible(false)}
            className="absolute inset-0"
          />
          <View className="w-80 rounded-2xl bg-white p-5">
            <View className="flex-row items-center">
              <View className="mr-3 rounded-full bg-sky-100 p-2">
                <Ionicons name="information-circle" size={20} color="#0EA5E9" />
              </View>
              <Text className="text-lg font-bold text-slate-900">
                학습을 종료할까요?
              </Text>
            </View>

            <Text className="mt-3 text-slate-600">
              지금까지의 진행 상태가 저장되고 피드백 화면으로 이동합니다.
            </Text>

            <View className="mt-5 flex-row justify-end gap-2">
              <Pressable
                onPress={() => setModalVisible(false)}
                className="rounded-full bg-slate-100 px-4 py-2 active:opacity-80"
              >
                <Text className="font-semibold text-slate-700">계속 학습</Text>
              </Pressable>

              <Pressable
                onPress={goFeedback}
                className="rounded-full bg-red-500 px-4 py-2 active:opacity-90"
              >
                <Text className="font-semibold text-white">종료</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}
