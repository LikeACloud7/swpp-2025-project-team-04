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
  onPress: () => void;
  onLongPress: (layout: WordLayout) => void;
  appendSpace?: boolean;
};

export default function Word({
  text,
  isHighlighted = false,
  onPress,
  onLongPress,
  appendSpace = false,
}: WordProps) {
  const touchableRef = useRef<View>(null);

  const handleLongPress = () => {
    // 롱프레스 인식 시 아주 약한 진동
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
        onLongPress({ x, y, width, height }); // 화면 절대좌표
      });
    } else if (node?.measure) {
      node.measure((_x, _y, width, height, pageX, pageY) => {
        onLongPress({ x: pageX, y: pageY, width, height }); // 폴백
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
      // 손 올려져 있을 때 살짝 어두워지게
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1, // 눌렀을 때만 살짝 어둡게
        },
      ]}
    >
      <Text
        suppressHighlighting
        className={`text-center text-xl text-white ${
          isHighlighted ? 'font-bold' : 'font-semibold'
        }`}
      >
        {appendSpace ? `${text} ` : text}
      </Text>
    </Pressable>
  );
}
