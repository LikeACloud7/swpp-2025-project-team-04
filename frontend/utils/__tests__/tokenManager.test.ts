import * as SecureStore from 'expo-secure-store';
import {
  setAccessToken,
  getAccessToken,
  saveRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
} from '../tokenManager';

jest.mock('expo-secure-store');

describe('tokenManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAccessToken(null);
  });

  describe('Access Token (메모리 저장)', () => {
    it('토큰 설정 및 조회', () => {
      const token = 'test-access-token';

      setAccessToken(token);
      expect(getAccessToken()).toBe(token);
    });

    it('토큰을 null로 설정 가능', () => {
      setAccessToken('some-token');
      setAccessToken(null);
      expect(getAccessToken()).toBeNull();
    });

    it('초기 상태는 null', () => {
      expect(getAccessToken()).toBeNull();
    });

    it('여러 번 설정 시 마지막 값 유지', () => {
      setAccessToken('token1');
      setAccessToken('token2');
      setAccessToken('token3');
      expect(getAccessToken()).toBe('token3');
    });
  });

  describe('Refresh Token (SecureStore 저장)', () => {
    it('토큰 저장', async () => {
      const token = 'test-refresh-token';

      await saveRefreshToken(token);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'refreshToken',
        token,
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
    });

    it('토큰 조회', async () => {
      const mockToken = 'stored-refresh-token';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);

      const result = await getRefreshToken();

      expect(result).toBe(mockToken);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('refreshToken');
      expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1);
    });

    it('토큰이 없을 때 null 반환', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await getRefreshToken();

      expect(result).toBeNull();
    });

    it('토큰 삭제', async () => {
      await deleteRefreshToken();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
    });

    it('여러 토큰 작업 순차 실행', async () => {
      const token1 = 'token1';
      const token2 = 'token2';

      await saveRefreshToken(token1);
      await saveRefreshToken(token2);
      await deleteRefreshToken();

      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('통합 시나리오', () => {
    it('access token과 refresh token 동시 관리', async () => {
      const accessToken = 'access-123';
      const refreshToken = 'refresh-456';

      setAccessToken(accessToken);
      await saveRefreshToken(refreshToken);

      expect(getAccessToken()).toBe(accessToken);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'refreshToken',
        refreshToken,
      );
    });

    it('로그아웃 시나리오: 두 토큰 모두 제거', async () => {
      setAccessToken('access-token');
      await saveRefreshToken('refresh-token');

      setAccessToken(null);
      await deleteRefreshToken();

      expect(getAccessToken()).toBeNull();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
    });

    it('토큰 갱신 시나리오', async () => {
      setAccessToken('old-access');
      await saveRefreshToken('old-refresh');

      setAccessToken('new-access');
      await saveRefreshToken('new-refresh');

      expect(getAccessToken()).toBe('new-access');
      expect(SecureStore.setItemAsync).toHaveBeenLastCalledWith(
        'refreshToken',
        'new-refresh',
      );
    });
  });

  describe('에러 처리', () => {
    it('SecureStore 에러 시 예외 전파', async () => {
      const error = new Error('SecureStore error');
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(error);

      await expect(saveRefreshToken('token')).rejects.toThrow(
        'SecureStore error',
      );
    });
  });
});
