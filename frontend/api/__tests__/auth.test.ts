import { signup, login, changePassword, deleteAccount } from '../auth';
import { customFetch } from '../client';

jest.mock('../client');

const mockCustomFetch = customFetch as jest.MockedFunction<typeof customFetch>;

describe('auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('회원가입 성공', async () => {
      const payload = {
        username: 'testuser',
        password: 'password123',
        nickname: 'Test User',
      };

      const mockResponse = {
        user: { id: 1, username: 'testuser', nickname: 'Test User' },
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await signup(payload);

      expect(mockCustomFetch).toHaveBeenCalledWith('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockResponse);
    });

    it('회원가입 실패 시 에러 throw', async () => {
      const payload = {
        username: 'testuser',
        password: 'password123',
        nickname: 'Test User',
      };

      const error = new Error('Username already exists');
      mockCustomFetch.mockRejectedValue(error);

      await expect(signup(payload)).rejects.toThrow('Username already exists');
    });
  });

  describe('login', () => {
    it('로그인 성공', async () => {
      const payload = {
        username: 'testuser',
        password: 'password123',
      };

      const mockResponse = {
        user: { id: 1, username: 'testuser' },
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await login(payload);

      expect(mockCustomFetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockResponse);
    });

    it('잘못된 자격증명으로 로그인 실패', async () => {
      const payload = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockCustomFetch.mockRejectedValue(error);

      await expect(login(payload)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('changePassword', () => {
    it('비밀번호 변경 성공', async () => {
      const payload = {
        currentPassword: 'oldpass123',
        newPassword: 'newpass456',
      };

      const mockResponse = {
        message: 'Password changed successfully',
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await changePassword(payload);

      expect(mockCustomFetch).toHaveBeenCalledWith('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: payload.currentPassword,
          new_password: payload.newPassword,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('현재 비밀번호 불일치 시 실패', async () => {
      const payload = {
        currentPassword: 'wrongpass',
        newPassword: 'newpass456',
      };

      const error = new Error('Current password is incorrect');
      mockCustomFetch.mockRejectedValue(error);

      await expect(changePassword(payload)).rejects.toThrow(
        'Current password is incorrect',
      );
    });
  });

  describe('deleteAccount', () => {
    it('계정 삭제 성공', async () => {
      const mockResponse = {
        message: 'Account deleted successfully',
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await deleteAccount();

      expect(mockCustomFetch).toHaveBeenCalledWith('/auth/delete-account', {
        method: 'DELETE',
      });
      expect(result).toEqual(mockResponse);
    });

    it('계정 삭제 실패', async () => {
      const error = new Error('Failed to delete account');
      mockCustomFetch.mockRejectedValue(error);

      await expect(deleteAccount()).rejects.toThrow('Failed to delete account');
    });
  });
});
