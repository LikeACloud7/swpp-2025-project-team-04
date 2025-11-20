import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as statsAPI from '@/api/stats';
import { useStats } from '../queries/useStatsQueries';
import { STATS_QUERY_KEY } from '@/constants/queryKeys';
import type { StatsResponse } from '@/api/stats';
import type { ApiError } from '@/api/client';

jest.mock('@/api/stats');

describe('useStatsQueries', () => {
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

  describe('useStats', () => {
    it('통계 데이터 조회 성공', async () => {
      const mockStats: StatsResponse = {
        totalWords: 100,
        studiedToday: 20,
        streak: 5,
        level: 'intermediate',
      };

      (statsAPI.getStats as jest.Mock).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(statsAPI.getStats).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockStats);
    });

    it('staleTime 설정 확인 (5분)', async () => {
      const mockStats: StatsResponse = {
        totalWords: 50,
        studiedToday: 10,
      };

      (statsAPI.getStats as jest.Mock).mockResolvedValue(mockStats);

      const { result, rerender } = renderHook(() => useStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(statsAPI.getStats).toHaveBeenCalledTimes(1);

      rerender();

      expect(statsAPI.getStats).toHaveBeenCalledTimes(1);
    });

    it('캐시된 데이터 사용', async () => {
      const mockStats: StatsResponse = {
        totalWords: 75,
        studiedToday: 15,
        streak: 3,
      };

      queryClient.setQueryData(STATS_QUERY_KEY, mockStats);

      const { result } = renderHook(() => useStats(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toEqual(mockStats);
    });

    it('다양한 통계 데이터 형식 처리', async () => {
      const statsVariations: StatsResponse[] = [
        {
          totalWords: 0,
          studiedToday: 0,
        },
        {
          totalWords: 1000,
          studiedToday: 100,
          streak: 30,
        },
        {
          totalWords: 50,
          studiedToday: 5,
          level: 'beginner',
          accuracy: 85.5,
        },
        {
          totalWords: 500,
          studiedToday: 25,
          streak: 7,
          level: 'advanced',
          weeklyProgress: [10, 15, 20, 25, 30, 25, 20],
        },
      ];

      for (const stats of statsVariations) {
        queryClient.clear();
        (statsAPI.getStats as jest.Mock).mockResolvedValue(stats);

        const { result } = renderHook(() => useStats(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(stats);
      }
    });

    it('로딩 상태 확인', async () => {
      let resolvePromise: (value: StatsResponse) => void;
      const promise = new Promise<StatsResponse>((resolve) => {
        resolvePromise = resolve;
      });

      (statsAPI.getStats as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useStats(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);

      const mockStats: StatsResponse = {
        totalWords: 100,
        studiedToday: 20,
      };

      resolvePromise!(mockStats);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.isPending).toBe(false);
    });

    it('refetch 기능 동작 확인', async () => {
      const mockStats1: StatsResponse = {
        totalWords: 100,
        studiedToday: 20,
      };

      const mockStats2: StatsResponse = {
        totalWords: 110,
        studiedToday: 30,
      };

      (statsAPI.getStats as jest.Mock)
        .mockResolvedValueOnce(mockStats1)
        .mockResolvedValueOnce(mockStats2);

      const { result } = renderHook(() => useStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockStats1);

      await result.current.refetch();

      await waitFor(() => expect(result.current.data).toEqual(mockStats2));
      expect(statsAPI.getStats).toHaveBeenCalledTimes(2);
    });

    it('빈 통계 데이터 처리', async () => {
      const emptyStats: StatsResponse = {
        totalWords: 0,
        studiedToday: 0,
        streak: 0,
      };

      (statsAPI.getStats as jest.Mock).mockResolvedValue(emptyStats);

      const { result } = renderHook(() => useStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.totalWords).toBe(0);
      expect(result.current.data?.studiedToday).toBe(0);
    });
  });
});
