import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as vocabAPI from '@/api/vocab';
import {
  useVocab,
  useMyVocab,
  useDeleteMyVocab,
} from '../queries/useVocabQueries';
import { MY_VOCAB_QUERY_KEY, VOCAB_QUERY_KEY } from '@/constants/queryKeys';
import type { VocabResponse, MyVocab } from '@/api/vocab';
import type { ApiError } from '@/api/client';

jest.mock('@/api/vocab');

describe('useVocabQueries', () => {
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

  describe('useVocab', () => {
    it('특정 콘텐츠의 단어 목록 조회 성공', async () => {
      const mockVocabResponse: VocabResponse = {
        generatedContentId: 123,
        words: [
          {
            id: 1,
            word: 'hello',
            translation: '안녕하세요',
            index: 0,
          },
          {
            id: 2,
            word: 'world',
            translation: '세계',
            index: 1,
          },
        ],
      };

      (vocabAPI.getVocab as jest.Mock).mockResolvedValue(mockVocabResponse);

      const { result } = renderHook(() => useVocab(123), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(vocabAPI.getVocab).toHaveBeenCalledWith(123);
      expect(result.current.data).toEqual(mockVocabResponse);
    });

    it('다른 콘텐츠 ID로 조회', async () => {
      const contentIds = [100, 200, 300];

      for (const contentId of contentIds) {
        queryClient.clear();

        const mockResponse: VocabResponse = {
          generatedContentId: contentId,
          words: [
            {
              id: contentId * 10,
              word: `word${contentId}`,
              translation: `단어${contentId}`,
              index: 0,
            },
          ],
        };

        (vocabAPI.getVocab as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useVocab(contentId), {
          wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(vocabAPI.getVocab).toHaveBeenCalledWith(contentId);
        expect(result.current.data?.generatedContentId).toBe(contentId);
      }
    });

    it('빈 단어 목록 처리', async () => {
      const mockResponse: VocabResponse = {
        generatedContentId: 123,
        words: [],
      };

      (vocabAPI.getVocab as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useVocab(123), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.words).toEqual([]);
    });
  });

  describe('useMyVocab', () => {
    it('내 단어장 전체 조회 성공', async () => {
      const mockMyVocab: MyVocab[] = [
        {
          id: 1,
          word: 'apple',
          translation: '사과',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          word: 'banana',
          translation: '바나나',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      (vocabAPI.getMyVocab as jest.Mock).mockResolvedValue(mockMyVocab);

      const { result } = renderHook(() => useMyVocab(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(vocabAPI.getMyVocab).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockMyVocab);
    });

    it('빈 단어장 처리', async () => {
      (vocabAPI.getMyVocab as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useMyVocab(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('캐시된 데이터 사용', async () => {
      const mockVocab: MyVocab[] = [
        {
          id: 1,
          word: 'cached',
          translation: '캐시됨',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      queryClient.setQueryData([MY_VOCAB_QUERY_KEY], mockVocab);

      const { result } = renderHook(() => useMyVocab(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toEqual(mockVocab);
    });

    it('다양한 형식의 단어 처리', async () => {
      const mockVocab: MyVocab[] = [
        {
          id: 1,
          word: 'simple',
          translation: '간단한',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          word: "it's",
          translation: '그것은',
          createdAt: '2024-01-02T00:00:00Z',
          example: "It's a beautiful day",
        },
        {
          id: 3,
          word: 'hello-world',
          translation: '헬로 월드',
          createdAt: '2024-01-03T00:00:00Z',
          pronunciation: '/həˈloʊ wɜːrld/',
        },
      ];

      (vocabAPI.getMyVocab as jest.Mock).mockResolvedValue(mockVocab);

      const { result } = renderHook(() => useMyVocab(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(3);
    });
  });

  describe('useDeleteMyVocab', () => {
    it('단어 삭제 성공', async () => {
      (vocabAPI.deleteMyVocab as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteMyVocab(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(123);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(vocabAPI.deleteMyVocab).toHaveBeenCalledWith(123);
    });

    it('삭제 성공 시 단어장 쿼리 무효화', async () => {
      (vocabAPI.deleteMyVocab as jest.Mock).mockResolvedValue(undefined);

      const mockVocab: MyVocab[] = [
        {
          id: 1,
          word: 'test',
          translation: '테스트',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      queryClient.setQueryData([MY_VOCAB_QUERY_KEY], mockVocab);

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteMyVocab(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [MY_VOCAB_QUERY_KEY],
      });
    });

    it('단어 삭제 실패 시 에러 처리', async () => {
      const error: ApiError = {
        status: 404,
        message: 'Word not found',
      };

      (vocabAPI.deleteMyVocab as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteMyVocab(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(999);

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });

    it('여러 단어 순차적 삭제', async () => {
      (vocabAPI.deleteMyVocab as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteMyVocab(), {
        wrapper: createWrapper(),
      });

      const wordIds = [1, 2, 3];

      for (const wordId of wordIds) {
        result.current.mutate(wordId);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(vocabAPI.deleteMyVocab).toHaveBeenCalledWith(wordId);
        result.current.reset();
      }

      expect(vocabAPI.deleteMyVocab).toHaveBeenCalledTimes(3);
    });

    it('로딩 상태 확인', async () => {
      let resolvePromise: (value: void) => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      (vocabAPI.deleteMyVocab as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useDeleteMyVocab(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isPending).toBe(true));

      resolvePromise!();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.isPending).toBe(false);
    });

    it('401 에러 처리', async () => {
      const error: ApiError = {
        status: 401,
        message: 'Unauthorized',
      };

      (vocabAPI.deleteMyVocab as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteMyVocab(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.status).toBe(401);
    });
  });
});
