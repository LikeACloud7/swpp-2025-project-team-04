import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as vocabAPI from '@/api/vocab';
import { useAddVocab } from '../mutations/useVocabMutations';
import { STATS_QUERY_KEY } from '@/constants/queryKeys';

jest.mock('@/api/vocab');

describe('useVocabMutations', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return wrapper;
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useAddVocab', () => {
    it('단어 추가 성공', async () => {
      (vocabAPI.addVocab as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAddVocab(), {
        wrapper: createWrapper(),
      });

      const vocabData = {
        generatedContentId: 123,
        pendingVocab: {
          sentenceIndex: 0,
          word: 'hello',
        },
      };

      result.current.mutate(vocabData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(vocabAPI.addVocab).toHaveBeenCalledWith(123, 0, 'hello');
    });

    it('단어 추가 성공 시 통계 쿼리 무효화', async () => {
      (vocabAPI.addVocab as jest.Mock).mockResolvedValue(undefined);

      queryClient.setQueryData([STATS_QUERY_KEY], {
        totalWords: 10,
        studiedToday: 5,
      });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useAddVocab(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        generatedContentId: 123,
        pendingVocab: {
          sentenceIndex: 0,
          word: 'world',
        },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [STATS_QUERY_KEY],
      });
    });

    it('단어 추가 실패 시 에러 처리', async () => {
      const error = new Error('Failed to add vocab');
      (vocabAPI.addVocab as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAddVocab(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        generatedContentId: 123,
        pendingVocab: {
          sentenceIndex: 0,
          word: 'test',
        },
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });

    it('다양한 단어 추가', async () => {
      (vocabAPI.addVocab as jest.Mock).mockResolvedValue(undefined);

      const words = [
        { generatedContentId: 100, sentenceIndex: 0, word: 'apple' },
        { generatedContentId: 101, sentenceIndex: 1, word: 'banana' },
        { generatedContentId: 102, sentenceIndex: 2, word: 'cherry' },
      ];

      for (const wordData of words) {
        const { result } = renderHook(() => useAddVocab(), {
          wrapper: createWrapper(),
        });

        result.current.mutate({
          generatedContentId: wordData.generatedContentId,
          pendingVocab: {
            sentenceIndex: wordData.sentenceIndex,
            word: wordData.word,
          },
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(vocabAPI.addVocab).toHaveBeenCalledWith(
          wordData.generatedContentId,
          wordData.sentenceIndex,
          wordData.word,
        );

        jest.clearAllMocks();
      }
    });

    it('동일한 generatedContentId에 여러 단어 추가', async () => {
      (vocabAPI.addVocab as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAddVocab(), {
        wrapper: createWrapper(),
      });

      const contentId = 200;
      const words = ['first', 'second', 'third'];

      for (let i = 0; i < words.length; i++) {
        result.current.mutate({
          generatedContentId: contentId,
          pendingVocab: {
            sentenceIndex: i,
            word: words[i],
          },
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(vocabAPI.addVocab).toHaveBeenCalledWith(contentId, i, words[i]);

        result.current.reset();
      }
    });

    it('로딩 상태 확인', async () => {
      let resolvePromise: (value: void) => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      (vocabAPI.addVocab as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useAddVocab(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        generatedContentId: 123,
        pendingVocab: {
          sentenceIndex: 0,
          word: 'loading',
        },
      });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      resolvePromise!();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.isPending).toBe(false);
    });

    it('특수 문자가 포함된 단어 추가', async () => {
      (vocabAPI.addVocab as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAddVocab(), {
        wrapper: createWrapper(),
      });

      const specialWords = [
        "can't",
        "it's",
        'hello-world',
        'test_word',
        'word123',
      ];

      for (let i = 0; i < specialWords.length; i++) {
        result.current.mutate({
          generatedContentId: 300,
          pendingVocab: {
            sentenceIndex: i,
            word: specialWords[i],
          },
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(vocabAPI.addVocab).toHaveBeenCalledWith(300, i, specialWords[i]);

        result.current.reset();
      }
    });
  });
});
