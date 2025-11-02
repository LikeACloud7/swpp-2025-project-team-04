import type { ApiError } from '@/api/client';
import { getStats, type StatsResponse } from '@/api/stats';
import { STATS_QUERY_KEY } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useStats = () => {
  return useQuery<StatsResponse, ApiError>({
    queryKey: STATS_QUERY_KEY,
    queryFn: getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
