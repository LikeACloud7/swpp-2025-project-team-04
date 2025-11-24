import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DEVICE_WIDTH = Math.min(width - 96, 320);

type FlowStep = {
  key: 'generate' | 'session' | 'vocab';
  title: string;
  caption: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const FLOW_STEPS: FlowStep[] = [
  {
    key: 'generate',
    title: '홈',
    caption: '관심 주제와 분위기를 고르고 Generate로 세션을 만들어요.',
    hint: '맞춤 추천 흐름',
    icon: 'flash',
  },
  {
    key: 'session',
    title: '세션',
    caption: '스크립트와 오디오를 동시에 보며 하이라이트를 따라가요.',
    hint: '집중 청취',
    icon: 'headset',
  },
  {
    key: 'vocab',
    title: '단어장',
    caption: '모르는 단어를 길게 눌러 단어장에 저장하고 확인해요.',
    hint: '즉시 저장',
    icon: 'bookmarks',
  },
];

const AnimatedGradientBackground = () => {
  const gradientAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [gradientAnim]);

  const translate = gradientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 40],
  });
  const fade = gradientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.65],
  });

  return (
    <>
      <View className="absolute inset-0 bg-[#020b1a]" />
      <Animated.View
        style={{
          position: 'absolute',
          width: width * 1.6,
          height: width * 1.6,
          top: -width * 0.6,
          left: -width * 0.5,
          opacity: fade,
          transform: [{ translateX: translate }, { translateY: translate }],
        }}
      >
        <LinearGradient
          colors={['#051937', '#0C4A6E', '#0284C7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          width: width * 1.1,
          height: width * 1.1,
          bottom: -width * 0.3,
          right: -width * 0.5,
          opacity: 0.45,
          transform: [{ translateX: Animated.multiply(translate, -1) }],
        }}
      >
        <LinearGradient
          colors={['#082F49', '#0C4A6E', '#0369A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </>
  );
};

const HomePreview = ({ action }: { action: Animated.Value }) => {
  const pointerX = action.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 80, 0],
  });
  const pointerY = action.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 110, 0],
  });
  const buttonScale = action.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.95, 1.05, 0.95],
  });

  const chips = [
    { label: '🌎 여행', sub: 'Theme' },
    { label: '💼 비즈니스', sub: 'Theme' },
    { label: '🎧 집중', sub: 'Mood' },
    { label: '🌅 차분', sub: 'Mood' },
  ];

  return (
    <View className="relative h-full rounded-[30px] bg-white px-5 py-6 shadow-lg shadow-black/20">
      <Text className="text-sm font-semibold text-slate-500">관심 주제 선택</Text>
      <Text className="mt-1 text-2xl font-bold text-slate-900">
        Generate로 나만의 루틴
      </Text>
      <View className="mt-5 flex-row flex-wrap gap-3">
        {chips.map((chip, idx) => (
          <View
            key={chip.label}
            style={{
              width: (DEVICE_WIDTH - 64) / 2,
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <Text className="text-base font-semibold text-slate-800">
              {chip.label}
            </Text>
            <Text className="text-[11px] text-slate-400">{chip.sub}</Text>
            {idx === 0 && (
              <Text className="mt-2 text-[11px] text-slate-400">
                관심 기반 추천
              </Text>
            )}
          </View>
        ))}
      </View>
      <Animated.View
        style={{ transform: [{ scale: buttonScale }] }}
        className="mt-5 rounded-[26px] shadow-lg shadow-sky-200"
      >
        <LinearGradient
          colors={['#0EA5E9', '#38BDF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[26px]"
        >
          <View className="flex-row items-center justify-between px-6 py-4">
            <View>
              <Text className="text-[12px] uppercase tracking-[3px] text-white/70">
                generate
              </Text>
              <Text className="text-lg font-semibold text-white">
                오늘의 세션 만들기
              </Text>
            </View>
            <Ionicons name="flash" size={28} color="#ffffff" />
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateX: pointerX }, { translateY: pointerY }],
        }}
        className="pointer-events-none absolute left-10 top-28 rounded-full border-2 border-sky-300 bg-white/80 p-2"
      >
        <Ionicons name="hand-left-outline" size={18} color="#0EA5E9" />
      </Animated.View>
    </View>
  );
};

const SessionPreview = ({ action }: { action: Animated.Value }) => {
  const highlightY = action.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 72],
  });
  const sliderProgress = action.interpolate({
    inputRange: [0, 1],
    outputRange: ['35%', '75%'],
  });

  const scriptLines = [
    'AI가 추천한 스피치를 따라가요.',
    '하이라이트가 현재 문장을 보여줘요.',
    '필요하면 되돌리고 다시 듣습니다.',
    '단어는 길게 눌러 저장할 수 있어요.',
  ];

  return (
    <View className="h-full rounded-[30px] bg-white px-5 py-6 shadow-lg shadow-black/20">
      <Text className="text-sm font-semibold text-slate-500">세션 재생</Text>
      <Text className="mt-1 text-2xl font-bold text-slate-900">
        스크립트와 오디오 동시 진행
      </Text>
      <LinearGradient
        colors={['#0C4A6E', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mt-5 rounded-3xl p-4"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-xs uppercase tracking-[3px] text-white/70">
            focus mode
          </Text>
          <Text className="text-xs text-white/80">03:42 / 12:10</Text>
        </View>
        <View className="mt-4 flex-row items-center justify-between">
          <Ionicons name="play" size={28} color="#FFFFFF" />
          <View className="flex-row items-center gap-3">
            <Ionicons name="volume-high" size={22} color="#FFFFFF" />
            <Ionicons name="repeat" size={22} color="#FFFFFF" />
          </View>
        </View>
        <View className="mt-4 h-1.5 rounded-full bg-white/30">
          <Animated.View
            style={{ width: sliderProgress }}
            className="h-full rounded-full bg-white"
          />
        </View>
      </LinearGradient>
      <View className="mt-5 flex-1 rounded-3xl bg-slate-50 p-4">
        <View className="relative overflow-hidden rounded-2xl bg-white">
          <Animated.View
            style={{ transform: [{ translateY: highlightY }] }}
            className="absolute left-0 right-0 h-12 bg-sky-100/70"
          />
          {scriptLines.map((line) => (
            <View key={line} className="px-4 py-3">
              <Text className="text-[13px] text-slate-600">{line}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const VocabPreview = ({ action }: { action: Animated.Value }) => {
  const highlightScale = action.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 1.05, 0.9],
  });
  const cardTranslate = action.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [24, 0, 24],
  });
  const cardOpacity = action.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View className="h-full rounded-[30px] bg-white px-5 py-6 shadow-lg shadow-black/20">
      <Text className="text-sm font-semibold text-slate-500">단어 저장</Text>
      <Text className="mt-1 text-2xl font-bold text-slate-900">
        길게 눌러 단어장에 추가
      </Text>
      <View className="mt-5 flex-1 rounded-3xl bg-slate-50 p-4">
        <View className="rounded-3xl bg-white p-4">
          <Text className="text-xs uppercase tracking-[3px] text-slate-400">
            스크립트
          </Text>
          <Text className="mt-3 text-[13px] text-slate-500 leading-6">
            The speaker shares a{' '}
            <Animated.Text
              style={{ transform: [{ scale: highlightScale }] }}
              className="rounded-lg bg-sky-100 px-1 text-[13px] font-semibold text-sky-700"
            >
              breakthrough
            </Animated.Text>{' '}
            moment from last week.
          </Text>
          <Text className="mt-2 text-[13px] text-slate-400">
            단어를 길게 눌러 바로 저장하세요.
          </Text>
        </View>
        <Animated.View
          style={{
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslate }],
          }}
          className="mt-5 rounded-[24px] bg-white p-4 shadow-lg shadow-black/10"
        >
          <Text className="text-xs font-semibold uppercase tracking-[3px] text-slate-400">
            단어장
          </Text>
          <Text className="mt-2 text-2xl font-extrabold text-slate-900">
            breakthrough
          </Text>
          <Text className="mt-1 text-sm text-slate-500">뜻 · 획기적인 발견</Text>
          <View className="mt-3 rounded-2xl bg-slate-50 p-3">
            <Text className="text-xs text-slate-500">예문</Text>
            <Text className="mt-1 text-sm text-slate-700">
              This discovery was a breakthrough for the team.
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const DevicePreview = ({
  activeKey,
  actionAnim,
  screenScale,
}: {
  activeKey: FlowStep['key'];
  actionAnim: Animated.Value;
  screenScale: Animated.Value;
}) => {
  const renderScreen = () => {
    switch (activeKey) {
      case 'generate':
        return <HomePreview action={actionAnim} />;
      case 'session':
        return <SessionPreview action={actionAnim} />;
      case 'vocab':
        return <VocabPreview action={actionAnim} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: screenScale }] }}
      className="mt-10 items-center justify-center"
    >
      <View
        style={{ width: DEVICE_WIDTH, height: DEVICE_WIDTH * 1.8 }}
        className="overflow-hidden rounded-[42px] border border-white/5 bg-white/10 p-3 shadow-2xl shadow-black/40 backdrop-blur-md"
      >
        {renderScreen()}
      </View>
    </Animated.View>
  );
};

const StepSelector = ({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) => (
  <View className="mt-8 flex-row flex-wrap justify-center gap-3">
    {FLOW_STEPS.map((step, index) => {
      const isActive = index === activeIndex;
      if (isActive) {
        return (
          <LinearGradient
            key={step.key}
            colors={['#0EA5E9', '#38BDF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl"
          >
            <Pressable
              onPress={() => onSelect(index)}
              className="flex-row items-center gap-2 rounded-2xl px-4 py-2"
            >
              <Ionicons name={step.icon} size={16} color="#fff" />
              <Text className="text-sm font-semibold text-white">
                {step.title}
              </Text>
            </Pressable>
          </LinearGradient>
        );
      }
      return (
        <Pressable
          key={step.key}
          onPress={() => onSelect(index)}
          className="flex-row items-center gap-2 rounded-2xl border border-white/20 px-4 py-2"
        >
          <Ionicons name={step.icon} size={16} color="#94A3B8" />
          <Text className="text-sm text-white/70">{step.title}</Text>
        </Pressable>
      );
    })}
  </View>
);

export default function WalkthroughScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const [activeStep, setActiveStep] = useState(0);
  const actionAnim = useRef(new Animated.Value(0)).current;
  const screenScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(actionAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(actionAnim, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [actionAnim]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % FLOW_STEPS.length);
    }, 5200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    screenScale.setValue(0.95);
    Animated.spring(screenScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 70,
    }).start();
  }, [activeStep, screenScale]);

  const handleStart = () => {
    router.replace('/(main)');
  };

  return (
    <View className="flex-1 bg-black">
      <AnimatedGradientBackground />
      <ScrollView
        contentContainerStyle={{
          paddingTop: top + 12,
          paddingBottom: bottom + 32,
        }}
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold text-white">
          한눈에 보는 LingoFit 루틴
        </Text>

        <DevicePreview
          activeKey={FLOW_STEPS[activeStep].key}
          actionAnim={actionAnim}
          screenScale={screenScale}
        />

        <StepSelector activeIndex={activeStep} onSelect={setActiveStep} />

        <View className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
          <Text className="text-sm font-semibold text-white/80">
            {FLOW_STEPS[activeStep].title}
          </Text>
          <Text className="mt-2 text-base text-white/90">
            {FLOW_STEPS[activeStep].caption}
          </Text>
          <Text className="mt-2 text-sm text-white/60">
            {FLOW_STEPS[activeStep].hint}
          </Text>
        </View>

        <View className="mt-6">
          <LinearGradient
            colors={['#0EA5E9', '#38BDF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl"
          >
            <Pressable
              onPress={handleStart}
              className="w-full items-center rounded-3xl px-4 py-4"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-base font-semibold text-white">
                  지금 바로 LingoFit 시작
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            </Pressable>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}
