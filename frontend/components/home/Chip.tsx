import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: (label: string) => void;
  disabled?: boolean;
  shimmer?: boolean; // 선택 상태에서 셔머 효과 표시 여부 (기본 true)
};

export const Chip = memo(function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  shimmer = true,
}: ChipProps) {
  const isActive = !disabled;
  const shimmerX = useRef(new Animated.Value(0)).current;

  // 셔머 애니메이션 (선택 상태 & 활성일 때만)
  useEffect(() => {
    if (!(selected && isActive && shimmer)) {
      shimmerX.stopAnimation();
      shimmerX.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [selected, isActive, shimmer, shimmerX]);

  const translateRange = useMemo(
    () =>
      shimmerX.interpolate({
        inputRange: [0, 1],
        outputRange: [-120, 120],
      }),
    [shimmerX],
  );

  // 상태별 그라데이션 색 (readonly 튜플)
  const SELECTED_COLORS = ['#0EA5E9', '#38BDF8'] as const;
  const ACTIVE_COLORS = ['#F8FAFC', '#EEF2F7'] as const;
  const DISABLED_COLORS = ['#E5E7EB', '#F3F4F6'] as const;

  const gradientColors = selected
    ? SELECTED_COLORS
    : isActive
      ? ACTIVE_COLORS
      : DISABLED_COLORS;

  const borderClass = selected ? 'border-transparent' : 'border-gray-200';
  const textClass = selected ? 'text-white' : 'text-gray-700';
  const shadowClass = selected ? 'shadow-md' : 'shadow-sm';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!isActive}
      onPress={() => onPress?.(label)}
      hitSlop={8}
      className="mr-3"
      android_ripple={{ color: 'rgba(14,165,233,0.12)', borderless: false }}
      style={({ pressed }) => ({
        // 과한 흐림 대신 살짝만
        opacity: pressed ? 0.95 : 1,
        // 살짝 눌리는 느낌
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`relative overflow-hidden rounded-2xl border px-5 py-3 ${borderClass} ${shadowClass}`}
        >
          <View className="flex-row items-center justify-center">
            <Text className={`text-[15px] font-semibold ${textClass}`}>
              {label}
            </Text>
          </View>

          {/* iOS용 눌림 하이라이트(안드로이드에선 ripple과 함께 동작) */}
          {pressed && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: selected
                  ? 'rgba(255,255,255,0.12)' // 선택 칩은 밝게
                  : 'rgba(0,0,0,0.04)', // 일반 칩은 아주 옅게
              }}
            />
          )}

          {/* 선택 & 활성 & 셔머 on 일 때만 스트라이프 */}
          {selected && isActive && shimmer && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 100,
                transform: [{ translateX: translateRange }],
              }}
            >
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.0)',
                  'rgba(255,255,255,0.22)',
                  'rgba(255,255,255,0.0)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, transform: [{ skewX: '-15deg' } as any] }}
              />
            </Animated.View>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
});
