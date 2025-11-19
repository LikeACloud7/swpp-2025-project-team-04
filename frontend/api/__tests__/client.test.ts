import { getBaseUrl } from '../client';

describe('client', () => {
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_API_URL: 'https://api.test.com',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getBaseUrl', () => {
    it('하드코딩된 베이스 URL 반환', () => {
      const baseUrl = getBaseUrl();
      expect(baseUrl).toBe('http://52.78.135.45:3000');
    });

    it('환경 변수가 없어도 하드코딩된 URL 사용', () => {
      const baseUrl = getBaseUrl();
      expect(baseUrl).toBeTruthy();
      expect(typeof baseUrl).toBe('string');
    });
  });
});
