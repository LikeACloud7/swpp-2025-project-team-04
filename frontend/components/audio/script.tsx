import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';
import { Sentence } from '@/api/audio';
import Word, { WordLayout } from './Word';
import { useVocab } from '@/hooks/queries/useVocabQueries';
import { useAddVocab } from '@/hooks/mutations/useVocabMutations';
import { useFocusEffect } from 'expo-router';

// =================== Props & Local Types ===================
export type ScriptProps = {
  generatedContentId: number;
  scripts: Sentence[];
  onVocabLookup?: () => void; // 단어 검색 콜백
  onVocabSave?: () => void; // 단어 저장 콜백
  onRewind?: () => void; // 되감기 콜백
};

// Word popup 위치, 크기 관리
type WordPopupState = {
  word: string;
  sentenceIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

// 단어장에 추가 대기중인 단어 정보
type PendingVocab = {
  sentenceIndex: number;
  word: string;
};

// =================== Helper functions ==========
// 단어 정규화
const norm = (w: string) =>
  (w || '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}'-]/gu, '');

// vocab map (빠른 뜻/품사 조회용)
const makeVocabKey = (sentenceIndex: number, word: string) =>
  `${sentenceIndex}:${norm(word)}`;

// =================== Constants ===================
// Word popup 크기 조정 상수
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SAFE_PAD = 12;
const ARROW = 12;
const CARD_MAX_W = Math.min(220, SCREEN_W - SAFE_PAD * 2);
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

// ========== Component ==========
export default function Script({
  scripts,
  generatedContentId,
  onVocabLookup,
  onVocabSave,
  onRewind,
}: ScriptProps) {
  const { data: vocabData } = useVocab(generatedContentId);
  const [wordPopup, setWordPopup] = useState<WordPopupState>(null);
  const [isUserTouching, setIsUserTouching] = useState(false); // 사용자 터치 상태 관리
  const addVocabMutation = useAddVocab();

  // 되감기 감지를 위한 이전 position 추적
  const prevPositionRef = useRef<number>(0);

  // vocab map (빠른 뜻/품사 조회용)
  const vocabMap = useMemo(() => {
    const map = new Map<
      string,
      { pos: string; word: string; meaning: string }
    >();

    if (vocabData?.sentences?.length) {
      for (const s of vocabData.sentences) {
        for (const wd of s.words) {
          const k = makeVocabKey(s.index, wd.word);
          map.set(k, wd);
        }
      }
    }

    return map;
  }, [vocabData]);

  // 2-1. 현재 재생 위치 탐색하는 로직
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const currentLineIndexRef = useRef(-1); // 최신값 캐시
  const { position } = useProgress(100);
  const startTimes = useMemo(
    () => scripts.map((s) => parseFloat(s.start_time)),
    [scripts],
  );

  // 되감기 감지: position이 이전보다 2초 이상 뒤로 가면 rewind로 간주
  useEffect(() => {
    const REWIND_THRESHOLD = 2.0; // 초 단위
    if (prevPositionRef.current - position > REWIND_THRESHOLD) {
      onRewind?.();
    }
    prevPositionRef.current = position;
  }, [position, onRewind]);

  useEffect(() => {
    if (!startTimes.length) return;

    let idx = currentLineIndexRef.current;

    if (idx === -1 || position < startTimes[idx]) {
      idx = 0;
    }
    while (idx + 1 < startTimes.length && position >= startTimes[idx + 1]) {
      idx += 1;
    }

    currentLineIndexRef.current = idx;
    setCurrentLineIndex(idx);
  }, [position, startTimes]);

  // 2-2. 현재 재생 위치로 자동 스크롤하는 로직
  const flatListRef = useRef<FlatList<Sentence>>(null);

  useEffect(() => {
    if (!flatListRef.current) return;
    if (currentLineIndex < 0) return;
    if (wordPopup) return; // 팝업 열려 있으면 스크롤 막기
    if (isUserTouching) return; // 유저가 직접 터치 중이면 스크롤 막기

    flatListRef.current.scrollToIndex({
      index: currentLineIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, [currentLineIndex, wordPopup, isUserTouching]);

  // 2-3. 라인 누르면 해당 위치로 이동
  const onLinePress = (time: number, lineIndex: number) => {
    TrackPlayer.seekTo(time);

    setCurrentLineIndex(lineIndex);
    currentLineIndexRef.current = lineIndex;

    flatListRef.current?.scrollToIndex({
      // 속도 개선을 위해 바로 스크롤
      index: lineIndex,
      animated: true,
      viewPosition: 0.5,
    });
  };

  // 3. 팝업 위치, 크기 관리

  // 3-1. 깜빡임 방지: 카드 폭 캐시 + 초기 숨김
  const [cardW, setCardW] = useState<number>(Math.min(160, CARD_MAX_W));
  const [popupReady, setPopupReady] = useState<boolean>(false);
  const widthCacheRef = useRef<Map<string, number>>(new Map());

  // 3-2. 팝업 열기
  const handleWordLongPress = (
    word: string,
    layout: WordLayout,
    sentenceIndex: number,
  ) => {
    setPopupReady(false);
    const key = norm(word);
    const cachedW = widthCacheRef.current.get(key);
    setCardW(cachedW ?? CARD_MAX_W);

    setWordPopup({
      word,
      sentenceIndex,
      x: Number.isFinite(layout.x) ? layout.x : 0,
      y: Number.isFinite(layout.y) ? layout.y : 0,
      width: Number.isFinite(layout.width) ? layout.width : 0,
      height: Number.isFinite(layout.height) ? layout.height : 0,
    });
  };

  // 4. 단어장에 추가할 단어 관리
  const [pendingVocabs, setPendingVocabs] = useState<Map<string, PendingVocab>>(
    () => new Map(),
  );

  const pendingVocabsRef = useRef<Map<string, PendingVocab>>(new Map());

  // 4-1. 단어장 추가 대기 토글
  const togglePendingVocab = (word: string, sentenceIndex: number) => {
    const key = makeVocabKey(sentenceIndex, word);

    setPendingVocabs((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, { sentenceIndex, word });
      }

      pendingVocabsRef.current = next; // 최신값 캐시
      return next;
    });
  };

  // 4-2. 단어장에 추가 처리 함수 (화면 나갈 때 호출)
  const flushPendingVocabs = useCallback(() => {
    const finalMap = pendingVocabsRef.current;
    if (!finalMap.size) return;

    console.log('📝 화면 떠날 때 단어장 일괄 저장 시작');

    finalMap.forEach(({ sentenceIndex, word }) => {
      const key = makeVocabKey(sentenceIndex, word);
      const entry = vocabMap.get(key);
      const wordToSave = entry?.word ?? word;

      addVocabMutation.mutate({
        generatedContentId,
        index: sentenceIndex,
        word: wordToSave,
      });
    });
  }, [vocabMap, generatedContentId, addVocabMutation]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        flushPendingVocabs();
      };
    }, [flushPendingVocabs]),
  );

  // 5. 각 라인 렌더
  const renderLine = ({
    item,
    index: lineIndex,
  }: ListRenderItemInfo<Sentence>) => {
    const isHighlighted = lineIndex === currentLineIndex;
    const startTime = Number.parseFloat(item.start_time) || 0;
    const words = item.text?.trim()?.split(/\s+/) ?? ['...'];

    return (
      <Pressable
        onPress={() => onLinePress(startTime, lineIndex)}
        className={`px-6 ${isHighlighted ? 'py-3' : 'py-1.5'}`}
      >
        <View
          className={`flex-row flex-wrap justify-start gap-y-1 ${
            isHighlighted ? 'opacity-100' : 'opacity-50'
          }`}
        >
          {words.map((w, i) => (
            <Word
              key={`${item.id}-${i}`}
              text={w}
              appendSpace={i < words.length - 1}
              isHighlighted={isHighlighted}
              onPress={() => onLinePress(startTime, lineIndex)}
              onLongPress={(layout: WordLayout) =>
                handleWordLongPress(w, layout, lineIndex)
              }
            />
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <View className="flex-1">
        {/* 가사 부분 */}
        <FlatList
          ref={flatListRef}
          onTouchStart={() => setIsUserTouching(true)} // 터치 시작
          onTouchEnd={() => setIsUserTouching(false)} // 터치 끝
          onTouchCancel={() => setIsUserTouching(false)} // 터치 취소
          onScrollToIndexFailed={(info) => {
            // 스크롤 실패 시 약간의 오프셋을 주고 재시도
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.5,
              });
            }, 100);
          }}
          data={scripts}
          renderItem={renderLine}
          keyExtractor={(it) => it.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 28 }}
          ItemSeparatorComponent={() => <View className="h-1" />}
        />

        {/* 단어 팝업 */}
        {wordPopup && (
          <View className="absolute inset-0" pointerEvents="box-none">
            <Pressable
              className="absolute inset-0 bg-black/20"
              onPress={() => setWordPopup(null)}
            />

            {(() => {
              const centerX = wordPopup.x + wordPopup.width / 2;
              const desiredTopAbove = wordPopup.y - 68;
              const canPlaceAbove = desiredTopAbove >= SAFE_PAD + 4;

              const top = canPlaceAbove
                ? clamp(desiredTopAbove, SAFE_PAD, SCREEN_H - SAFE_PAD - 80)
                : clamp(
                    wordPopup.y + wordPopup.height + 8,
                    SAFE_PAD,
                    SCREEN_H - SAFE_PAD - 80,
                  );

              const left = clamp(
                centerX - cardW / 2,
                SAFE_PAD,
                SCREEN_W - (cardW + SAFE_PAD),
              );
              const arrowLeft = clamp(centerX - left - ARROW / 2, 8, cardW - 8);

              const key = makeVocabKey(wordPopup.sentenceIndex, wordPopup.word);
              const entry = vocabMap.get(key);

              const isQueued = pendingVocabs.has(key); // 이 단어가 현재 선택(북마크)된 상태인지

              return (
                <View className="absolute" style={{ top, left }}>
                  <View
                    className="rounded-2xl bg-white p-3"
                    style={{
                      maxWidth: CARD_MAX_W,
                      opacity: popupReady ? 1 : 0,
                    }}
                    onLayout={(e) => {
                      if (popupReady) return;
                      const w = e.nativeEvent.layout.width;
                      if (Number.isFinite(w)) {
                        widthCacheRef.current.set(key, w);
                        setCardW(w);
                        setPopupReady(true);
                      }
                    }}
                  >
                    {/* 1행: 단어 + 품사 + 단어장 버튼 */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center justify-start flex-shrink">
                        <Text className="text-[14px] font-extrabold text-slate-900">
                          {entry?.word ?? wordPopup.word}
                        </Text>
                        {entry?.pos ? (
                          <View className="ml-2 rounded-full bg-sky-100 px-2.5 py-0.5">
                            <Text className="text-[11px] font-extrabold tracking-tight text-sky-700">
                              {entry.pos}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Pressable
                        onPress={() =>
                          togglePendingVocab(
                            entry?.word ?? wordPopup.word,
                            wordPopup.sentenceIndex,
                          )
                        }
                        className="pl-2 active:opacity-70"
                        hitSlop={8}
                      >
                        {isQueued ? (
                          <Ionicons name="bookmark" size={16} color="#0EA5E9" />
                        ) : (
                          <Ionicons
                            name="bookmark-outline"
                            size={16}
                            color="#0EA5E9"
                          />
                        )}
                      </Pressable>
                    </View>

                    {/* 2행: 뜻 */}
                    <Text className="mt-1 text-[13px] font-semibold text-slate-800">
                      {entry?.meaning ?? '단어 뜻 불러오는 중...'}
                    </Text>

                    {/* 꼬리: 위/아래 방향 전환 */}
                    {canPlaceAbove ? (
                      <View
                        className="absolute -bottom-[5px] h-3 w-3 rotate-45 bg-white"
                        style={{ left: arrowLeft }}
                      />
                    ) : (
                      <View
                        className="absolute -top-[5px] h-3 w-3 rotate-45 bg-white"
                        style={{ left: arrowLeft }}
                      />
                    )}
                  </View>
                </View>
              );
            })()}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
