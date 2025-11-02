import { Sentence } from '@/api/audio';
import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  ListRenderItemInfo,
  Dimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackPlayer, { useProgress } from 'react-native-track-player';

export type ScriptProps = {
  scripts: Sentence[];
};

export default function Script({ scripts }: ScriptProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1); // 오디오에서의 index state
  const { position } = useProgress(250); // 250ms마다 재생 위치 업데이트

  const flatListRef = useRef<FlatList<Sentence>>(null); // 자동 스크롤용 ref

  // useEffect1: 현재 재생 위치에 맞는 가사 라인 인덱스 계산
  useEffect(() => {
    if (scripts.length === 0) return;

    let newIndex = -1;
    for (let i = 0; i < scripts.length; i++) {
      if (position >= parseFloat(scripts[i].start_time)) {
        newIndex = i;
      } else {
        break;
      }
    }

    if (newIndex !== currentLineIndex) {
      setCurrentLineIndex(newIndex);
    }
  }, [position, scripts, currentLineIndex]);

  // useEffect2: currentLineIndex가 변경될 때마다 해당 라인으로 스크롤
  useEffect(() => {
    if (flatListRef.current && currentLineIndex >= 0) {
      // 해당 index로 스크롤
      flatListRef.current.scrollToIndex({
        index: currentLineIndex,
        animated: true,
        viewPosition: 0.5, // 0.5 = 아이템을 화면 중앙에 위치시킴
      });
    }
  }, [currentLineIndex]);

  // 라인 클릭 시 오디오 재생 위치 변경 함수
  const onLinePress = (time: number) => {
    TrackPlayer.seekTo(time);
  };

  // 컴포넌트: 라인 한 줄
  const renderItem = ({ item, index }: ListRenderItemInfo<Sentence>) => {
    const isHighlighted = index === currentLineIndex;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onLinePress(parseFloat(item.start_time))}
      >
        <View
          className={`mb-3 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm ${isHighlighted ? 'border-primary bg-white shadow-lg' : ''}`}
        >
          <Text
            className={`text-center text-lg font-semibold text-slate-600 ${
              isHighlighted ? 'text-primary text-xl font-bold' : ''
            }`}
          >
            {item.text || '...'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 화면 높이의 일부를 헤더/푸터로 사용하여 첫/마지막 라인도 중앙에 오도록 함
  const listHeaderFooterHeight = Dimensions.get('window').height / 2.5;

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        ref={flatListRef}
        data={scripts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ height: listHeaderFooterHeight * 0.6 }} />
        }
        ListFooterComponent={
          <View style={{ height: listHeaderFooterHeight * 0.6 }} />
        }
      />
    </SafeAreaView>
  );
}
