import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioHistory } from '@/hooks/queries/useAudioQueries';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useFocusEffect } from '@react-navigation/native';
import type { AudioHistoryItem } from '@/api/audio';

export default function HistoryScreen() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(true);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAudioHistory();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, []),
  );

  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);
  const stopAndReset = useCallback(async () => {
    if (!player) return;
    try {
      await player.pause();
      await player.seekTo(0);
    } catch {}
    setActiveId(null);
  }, [player]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        stopAndReset();
      };
    }, [stopAndReset]),
  );

  useEffect(() => {
    return () => {
      stopAndReset();
    };
  }, [stopAndReset]);

  const handlePlayPause = useCallback(
    async (item: AudioHistoryItem) => {
      if (!player) return;

      if (activeId === item.generated_content_id) {
        if (status.playing) {
          await player.pause();
        } else {
          await player.play();
        }
      } else {
        try {
          await player.replace(item.audio_url);
          await player.play();
          setActiveId(item.generated_content_id);
        } catch {}
      }
    },
    [player, status, activeId],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EBF4FB]">
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text className="mt-2 text-slate-600">히스토리를 불러오는 중…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EBF4FB] px-6">
        <Text className="mb-3 text-center text-slate-700">
          히스토리를 불러오지 못했어요.
        </Text>
        <Text className="mb-4 text-center text-xs text-slate-500">
          {(error as any)?.message ?? '알 수 없는 오류'}
        </Text>
        <Text
          className="font-semibold text-sky-600"
          onPress={() => refetch()}
        >
          다시 시도하기
        </Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EBF4FB] px-8">
        <View className="mb-4 rounded-full bg-sky-100 p-4">
          <Ionicons name="headset-outline" size={36} color="#0EA5E9" />
        </View>
        <Text className="text-lg font-semibold text-slate-700">
          아직 생성된 오디오가 없어요
        </Text>
        <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
          홈에서 새로운 오디오를 생성해 보세요.
        </Text>
        <View className="mt-6 h-[1px] w-16 rounded-full bg-slate-200" />
      </View>
    );
  }

  const renderItem = useCallback(
    ({ item }: { item: AudioHistoryItem }) => {
      const isActive = activeId === item.generated_content_id;
      const isPlaying = isActive && status.playing;

      return (
        <View className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
          <Pressable
            onPress={() => handlePlayPause(item)}
            className="flex-row items-center justify-between p-4 active:bg-neutral-50"
          >
            <View className="flex-1 pr-3">
              <Text className="mb-1 text-base font-bold text-neutral-900">
                {item.title}
              </Text>
              <Text className="text-xs text-neutral-500">
                {formatDate(item.created_at)}
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color="white"
              />
            </View>
          </Pressable>

          {isActive && (
            <View className="border-t border-neutral-100 px-4 py-3">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-neutral-500">
                  {Math.floor((status.currentTime ?? 0) / 60)}:
                  {String(Math.floor((status.currentTime ?? 0) % 60)).padStart(2, '0')}
                </Text>
                <Text className="text-xs font-semibold text-neutral-500">
                  {Math.floor((status.duration ?? 0) / 60)}:
                  {String(Math.floor((status.duration ?? 0) % 60)).padStart(2, '0')}
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-neutral-200">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${
                      status.duration
                        ? ((status.currentTime ?? 0) / status.duration) * 100
                        : 0
                    }%`,
                  }}
                />
              </View>
            </View>
          )}
        </View>
      );
    },
    [activeId, status, handlePlayPause, formatDate],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-4">
        <ActivityIndicator color="#0EA5E9" />
      </View>
    );
  }, [isFetchingNextPage]);

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.generated_content_id.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}
