import React, { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export type WordLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WordProps = {
  text: string;
  isHighlighted?: boolean;
  isBookmarked?: boolean;
  onPress: () => void;
  onLongPress: (layout: WordLayout) => void;
  appendSpace?: boolean;
};

export default function Word({
  text,
  isHighlighted = false,
  isBookmarked = false,
  onPress,
  onLongPress,
  appendSpace = false,
}: WordProps) {
  const touchableRef = useRef<View>(null);

  const handleLongPress = () => {
    Haptics.selectionAsync().catch(() => {});

    const node = touchableRef.current as unknown as {
      measureInWindow?: (
        cb: (x: number, y: number, w: number, h: number) => void,
      ) => void;
      measure?: (
        cb: (
          x: number,
          y: number,
          w: number,
          h: number,
          pageX: number,
          pageY: number,
        ) => void,
      ) => void;
    };

    if (node?.measureInWindow) {
      node.measureInWindow((x, y, width, height) => {
        onLongPress({ x, y, width, height });
      });
    } else if (node?.measure) {
      node.measure((_x, _y, width, height, pageX, pageY) => {
        onLongPress({ x: pageX, y: pageY, width, height });
      });
    } else {
      onLongPress({ x: 0, y: 0, width: 0, height: 0 });
    }
  };

  return (
    <Pressable
      ref={touchableRef}
      onPress={onPress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {/* [구조 변경] 
        1. 바깥쪽 Text: 폰트 크기(text-xl), 정렬 등 공통 레이아웃 잡음
        2. 안쪽 Text: 실제 '단어'에만 배경색(형광펜) 적용
        3. 공백: 바깥쪽 Text의 스타일을 따라가되 배경색은 없음
      */}
      <Text className="text-center text-xl text-white">
        <Text
          suppressHighlighting
          className={`${
            isBookmarked ? 'bg-yellow-500/30 text-yellow-50' : 'text-white'
          } ${isHighlighted ? 'font-bold' : 'font-semibold'}`}
        >
          {text}
        </Text>
        {appendSpace ? ' ' : ''}
      </Text>
    </Pressable>
  );
}
