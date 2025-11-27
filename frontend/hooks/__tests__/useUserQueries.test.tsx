import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as userAPI from '@/api/user';
import { useUser } from '../queries/useUserQueries';
import { USER_QUERY_KEY } from '@/constants/queryKeys';
import type { User } from '@/types/type';
import type { ApiError } from '@/api/client';

jest.mock('@/api/user');

describe('useUserQueries', () => {
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

  describe('useUser', () => {
    it('초기 데이터는 null', () => {
      (userAPI.getMe as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      );

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeNull();
    });

    it('401 에러 시 null 반환', async () => {
      const unauthorizedError: ApiError = {
        status: 401,
        message: 'Unauthorized',
      };

      (userAPI.getMe as jest.Mock).mockRejectedValue(unauthorizedError);

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('네트워크 에러 처리', async () => {
      const error = new Error('Network error');
      (userAPI.getMe as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.data).toBeNull());
    });

    it('캐시된 데이터 사용', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
      };

      queryClient.setQueryData([USER_QUERY_KEY], mockUser);

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toEqual(mockUser);
    });

    it('비로그인 상태에서 정상 작동', async () => {
      const unauthorizedError: ApiError = {
        status: 401,
        message: 'Not authenticated',
      };

      (userAPI.getMe as jest.Mock).mockRejectedValue(unauthorizedError);

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
      expect(result.current.isError).toBe(false);
    });
  });
});
