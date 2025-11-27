import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as authAPI from '@/api/auth';
import * as tokenManager from '@/utils/tokenManager';
import {
  useSignup,
  useLogin,
  useLogout,
  useChangePassword,
  useDeleteAccount,
} from '../mutations/useAuthMutations';
import { USER_QUERY_KEY } from '@/constants/queryKeys';
import type { User } from '@/types/type';

jest.mock('@/api/auth');
jest.mock('@/utils/tokenManager');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
}));

const mockRouter = require('expo-router').useRouter();

describe('useAuthMutations', () => {
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

  describe('useSignup', () => {
    it('회원가입 실패 시 에러 처리', async () => {
      const error = new Error('Username already exists');
      (authAPI.signup as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useSignup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        username: 'testuser',
        password: 'password123',
        nickname: 'Test User',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useLogin', () => {
    it('로그인 실패 시 에러 처리', async () => {
      const error = new Error('Invalid credentials');
      (authAPI.login as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        username: 'testuser',
        password: 'wrongpassword',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useChangePassword', () => {
    it('비밀번호 변경 성공 시 사용자 캐시 유지', async () => {
      const mockUser = { id: 1, username: 'testuser' } as User;
      queryClient.setQueryData([USER_QUERY_KEY], mockUser);

      const mockResponse = { message: 'Password changed successfully' };
      (authAPI.changePassword as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChangePassword(), {
        wrapper: createWrapper(),
      });

      const passwordData = {
        currentPassword: 'oldpass123',
        newPassword: 'newpass456',
      };

      result.current.mutate(passwordData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authAPI.changePassword).toHaveBeenCalled();
      expect((authAPI.changePassword as jest.Mock).mock.calls[0][0]).toEqual(
        passwordData,
      );
      expect(queryClient.getQueryData([USER_QUERY_KEY])).toEqual(mockUser);
    });

    it('비밀번호 변경 실패 시 사용자 캐시 복원', async () => {
      const mockUser = { id: 1, username: 'testuser' } as User;
      queryClient.setQueryData([USER_QUERY_KEY], mockUser);

      const error = new Error('Current password is incorrect');
      (authAPI.changePassword as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useChangePassword(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        currentPassword: 'wrongpass',
        newPassword: 'newpass456',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(queryClient.getQueryData([USER_QUERY_KEY])).toEqual(mockUser);
    });
  });

  describe('useDeleteAccount', () => {
    it('계정 삭제 성공 시 사용자 캐시 제거', async () => {
      const mockUser = { id: 1, username: 'testuser' } as User;
      queryClient.setQueryData([USER_QUERY_KEY], mockUser);

      const mockResponse = { message: 'Account deleted successfully' };
      (authAPI.deleteAccount as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDeleteAccount(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authAPI.deleteAccount).toHaveBeenCalled();
      expect(queryClient.getQueryData([USER_QUERY_KEY])).toBeNull();
    });

    it('계정 삭제 실패 시 에러 처리', async () => {
      const error = new Error('Failed to delete account');
      (authAPI.deleteAccount as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteAccount(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });
});
