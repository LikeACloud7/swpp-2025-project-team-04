import { getMe } from '../user';
import { customFetch } from '../client';

jest.mock('../client');

const mockCustomFetch = customFetch as jest.MockedFunction<typeof customFetch>;

describe('user API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('현재 사용자 정보 조회 성공', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        email: 'test@example.com',
      };

      mockCustomFetch.mockResolvedValue(mockUser);

      const result = await getMe();

      expect(mockCustomFetch).toHaveBeenCalledWith('/users/me', {
        method: 'GET',
      });
      expect(result).toEqual(mockUser);
    });

    it('인증되지 않은 경우 실패', async () => {
      const error = new Error('Unauthorized');
      mockCustomFetch.mockRejectedValue(error);

      await expect(getMe()).rejects.toThrow('Unauthorized');
    });

    it('네트워크 에러 처리', async () => {
      const error = new Error('Network error');
      mockCustomFetch.mockRejectedValue(error);

      await expect(getMe()).rejects.toThrow('Network error');
    });
  });
});
