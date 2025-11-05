import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Sentence } from '@/api/audio';
import Word, { WordLayout } from './Word';
import { useVocab } from '@/hooks/queries/useVocabQueries';
import { useAddVocab } from '@/hooks/mutations/useVocabMutations';

// ========== Props & Local Types ==========
export type ScriptProps = {
  generatedContentId: number;
  scripts: Sentence[];
};

type WordPopupState = {
  word: string;
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

// ========== Helpers ==========
const norm = (w: string) =>
  (w || '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}'-]/gu, '');

// ========== Constants ==========
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SAFE_PAD = 12;
const ARROW = 12;
const CARD_MAX_W = Math.min(220, SCREEN_W - SAFE_PAD * 2);
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

// ========== Component ==========
export default function Script({ scripts, generatedContentId }: ScriptProps) {
  const { data: vocabData } = useVocab(generatedContentId);
  const addVocabMutation = useAddVocab();

  // vocab map (빠른 뜻/품사 조회용)
  const vocabMap = useMemo(() => {
    const map = new Map<
      string,
      { pos: string; word: string; meaning: string }
    >();
    if (vocabData?.sentences?.length) {
      for (const s of vocabData.sentences) {
        for (const wd of s.words) {
          const k = norm(wd.word);
          if (k && !map.has(k)) map.set(k, wd);
        }
      }
    }
    return map;
  }, [vocabData]);

  // 👉 단어 → 서버에 보낼 index 찾기
  // 현재 스키마상 VocabSentence.index(문장 인덱스)만 있어 확실치 않으므로,
  // "해당 단어가 처음 등장하는 문장의 index"를 사용.
  // 백엔드가 "단어 인덱스"를 요구한다면 여기 로직을 맞춰 조정하면 됨.
  const resolveVocabIndex = (rawWord: string): number | null => {
    if (!vocabData?.sentences?.length) return null;
    const key = norm(rawWord);
    for (const s of vocabData.sentences) {
      if (s.words.some((wd) => norm(wd.word) === key)) {
        return s.index; // 문장 인덱스 사용
      }
    }
    return null;
  };

  // 오디오 진행/현재 라인
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const { position } = useProgress(100);
  const flatListRef = useRef<FlatList<Sentence>>(null);

  useEffect(() => {
    if (scripts.length === 0) return;
    let newIndex = -1;
    for (let i = 0; i < scripts.length; i++) {
      if (position >= parseFloat(scripts[i].start_time)) newIndex = i;
      else break;
    }
    if (newIndex !== currentLineIndex) setCurrentLineIndex(newIndex);
  }, [position, scripts, currentLineIndex]);

  useEffect(() => {
    if (flatListRef.current && currentLineIndex >= 0) {
      flatListRef.current.scrollToIndex({
        index: currentLineIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [currentLineIndex]);

  const onLinePress = (time: number) => TrackPlayer.seekTo(time);

  // 팝업 상태
  const [wordPopup, setWordPopup] = useState<WordPopupState>(null);

  // 깜빡임 방지: 카드 폭 캐시 + 초기 숨김
  const [cardW, setCardW] = useState<number>(Math.min(160, CARD_MAX_W));
  const [popupReady, setPopupReady] = useState<boolean>(false);
  const widthCacheRef = useRef<Map<string, number>>(new Map());

  // 저장 피드백용(해당 단어 저장되면 아이콘 바꿈)
  const [lastSavedKey, setLastSavedKey] = useState<string | null>(null);

  const handleWordLongPress = (word: string, layout: WordLayout) => {
    setPopupReady(false);
    const key = norm(word);
    const cachedW = widthCacheRef.current.get(key);
    setCardW(cachedW ?? CARD_MAX_W);

    setWordPopup({
      word,
      x: Number.isFinite(layout.x) ? layout.x : 0,
      y: Number.isFinite(layout.y) ? layout.y : 0,
      width: Number.isFinite(layout.width) ? layout.width : 0,
      height: Number.isFinite(layout.height) ? layout.height : 0,
    });
  };
  const handleClosePopup = () => setWordPopup(null);

  // 각 아이템 렌더
  const renderItem = ({ item, index }: ListRenderItemInfo<Sentence>) => {
    const isHighlighted = index === currentLineIndex;
    const start = parseFloat(item.start_time);
    const time = Number.isFinite(start) ? start : 0;
    const text = item.text?.trim() ?? '';
    const words = text.length ? text.split(/\s+/) : ['...'];

    return (
      <Pressable
        onPress={() => {
          onLinePress(time);
          setWordPopup(null);
        }}
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
              onPress={() => {
                onLinePress(time);
                setWordPopup(null);
              }}
              onLongPress={(layout: WordLayout) =>
                handleWordLongPress(w, layout)
              }
            />
          ))}
        </View>
      </Pressable>
    );
  };

  // 단어장 추가 버튼 핸들러
  const handleAddVocab = (rawWord: string) => {
    // 1) 정규화 & 사전 엔트리 조회
    const key = norm(rawWord);
    const entry = vocabMap.get(key);
    const wordToSave = entry?.word ?? rawWord; // 사전에 있으면 표제어, 없으면 원문

    // 2) 인덱스 결정(표제어 우선, 실패 시 원문으로 재시도)
    const idx = resolveVocabIndex(wordToSave) ?? resolveVocabIndex(rawWord);

    if (idx == null) {
      console.warn('[Vocab] 해당 단어의 index를 찾지 못함:', rawWord);
      return;
    }

    // 3) 뮤테이션 호출
    addVocabMutation.mutate(
      { generatedContentId, index: idx, word: wordToSave },
      {
        onSuccess: () => {
          setLastSavedKey(key); // 마지막 저장된 키(정규화) 보관
        },
        onError: (e) => {
          console.error('📕 단어 저장 실패:', wordToSave, e);
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={scripts}
          renderItem={renderItem}
          keyExtractor={(it) => it.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<View style={{ height: 28 }} />}
          ListFooterComponent={<View style={{ height: 28 }} />}
          ItemSeparatorComponent={() => <View className="h-1" />}
          removeClippedSubviews
        />

        {wordPopup && (
          <View className="absolute inset-0" pointerEvents="box-none">
            <Pressable
              className="absolute inset-0"
              onPress={handleClosePopup}
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

              const key = norm(wordPopup.word);
              const entry = key ? vocabMap.get(key) : undefined;

              const isSaving = addVocabMutation.isPending;
              const isSaved = lastSavedKey === key && !isSaving;

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
                        disabled={isSaving}
                        onPress={() =>
                          handleAddVocab(entry?.word ?? wordPopup.word)
                        }
                        className="pl-2 active:opacity-70"
                        hitSlop={8}
                      >
                        {isSaving || isSaved ? (
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
