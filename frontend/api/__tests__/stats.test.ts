import { getStats } from '../stats';
import { customFetch } from '../client';

jest.mock('../client');

const mockCustomFetch = customFetch as jest.MockedFunction<typeof customFetch>;

describe('stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('통계 조회 성공', async () => {
      const mockResponse = {
        streak: {
          consecutive_days: 7,
          weekly_total_minutes: 120,
          daily_minutes: [
            { date: '2024-01-01', minutes: 20 },
            { date: '2024-01-02', minutes: 15 },
          ],
        },
        current_level: {
          lexical: { cefr_level: 'B1', score: 75 },
          syntactic: { cefr_level: 'B1', score: 80 },
          auditory: { cefr_level: 'B2', score: 85 },
          overall_cefr_level: { cefr_level: 'B1', score: 78 },
          updated_at: '2024-01-01T00:00:00Z',
        },
        total_time_spent_minutes: 500,
        achievements: [
          {
            code: 'first_week',
            name: 'First Week',
            description: 'Completed first week',
            category: 'streak',
            achieved: true,
            achieved_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getStats();

      expect(mockCustomFetch).toHaveBeenCalledWith('/stats', {
        method: 'GET',
      });
      expect(result).toEqual(mockResponse);
      expect(result.streak.consecutive_days).toBe(7);
      expect(result.achievements).toHaveLength(1);
    });

    it('초보자 통계 (스트릭 0)', async () => {
      const mockResponse = {
        streak: {
          consecutive_days: 0,
          weekly_total_minutes: 0,
          daily_minutes: [],
        },
        current_level: {
          lexical: { cefr_level: 'A1', score: 10 },
          syntactic: { cefr_level: 'A1', score: 15 },
          auditory: { cefr_level: 'A1', score: 20 },
          overall_cefr_level: { cefr_level: 'A1', score: 15 },
          updated_at: '2024-01-01T00:00:00Z',
        },
        total_time_spent_minutes: 0,
        achievements: [],
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getStats();

      expect(result.streak.consecutive_days).toBe(0);
      expect(result.total_time_spent_minutes).toBe(0);
      expect(result.achievements).toHaveLength(0);
    });

    it('고급 사용자 통계', async () => {
      const mockResponse = {
        streak: {
          consecutive_days: 100,
          weekly_total_minutes: 300,
          daily_minutes: Array.from({ length: 7 }, (_, i) => ({
            date: `2024-01-${String(i + 1).padStart(2, '0')}`,
            minutes: 40 + i * 5,
          })),
        },
        current_level: {
          lexical: { cefr_level: 'C2', score: 95 },
          syntactic: { cefr_level: 'C2', score: 98 },
          auditory: { cefr_level: 'C2', score: 97 },
          overall_cefr_level: { cefr_level: 'C2', score: 96 },
          updated_at: '2024-01-01T00:00:00Z',
        },
        total_time_spent_minutes: 5000,
        achievements: [
          {
            code: '100_days',
            name: '100 Days Streak',
            description: '100 consecutive days',
            category: 'streak',
            achieved: true,
            achieved_at: '2024-01-01T00:00:00Z',
          },
          {
            code: 'expert',
            name: 'Expert',
            description: 'Reached C2 level',
            category: 'level',
            achieved: true,
            achieved_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getStats();

      expect(result.streak.consecutive_days).toBeGreaterThanOrEqual(100);
      expect(result.current_level.overall_cefr_level.cefr_level).toBe('C2');
      expect(result.achievements.length).toBeGreaterThan(0);
    });

    it('통계 조회 실패', async () => {
      const error = new Error('Failed to fetch stats');
      mockCustomFetch.mockRejectedValue(error);

      await expect(getStats()).rejects.toThrow('Failed to fetch stats');
    });

    it('인증 에러', async () => {
      const error = new Error('Unauthorized');
      mockCustomFetch.mockRejectedValue(error);

      await expect(getStats()).rejects.toThrow('Unauthorized');
    });
  });
});
