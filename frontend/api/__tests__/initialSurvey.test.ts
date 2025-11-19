import {
  submitLevelTest,
  submitManualLevel,
  mapLevelIdToCEFR,
  generateScriptId,
  getAudioUrl,
} from '../initialSurvey';
import { customFetch } from '../client';

jest.mock('../client');

const mockCustomFetch = customFetch as jest.MockedFunction<typeof customFetch>;

describe('initialSurvey API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapLevelIdToCEFR', () => {
    it('레벨 ID를 CEFR로 변환', () => {
      expect(mapLevelIdToCEFR('1')).toBe('A1');
      expect(mapLevelIdToCEFR('2')).toBe('A2');
      expect(mapLevelIdToCEFR('3')).toBe('B1');
      expect(mapLevelIdToCEFR('4')).toBe('B2');
      expect(mapLevelIdToCEFR('5')).toBe('C1');
      expect(mapLevelIdToCEFR('6')).toBe('C2');
    });
  });

  describe('generateScriptId', () => {
    it('각 레벨별 script ID 생성', () => {
      expect(generateScriptId('A1', 1)).toBe('1');
      expect(generateScriptId('A1', 5)).toBe('5');
      expect(generateScriptId('A2', 1)).toBe('6');
      expect(generateScriptId('B1', 1)).toBe('11');
      expect(generateScriptId('B2', 1)).toBe('16');
      expect(generateScriptId('C1', 1)).toBe('21');
      expect(generateScriptId('C2', 1)).toBe('26');
    });

    it('같은 레벨 내 다른 질문 번호', () => {
      expect(generateScriptId('A1', 1)).toBe('1');
      expect(generateScriptId('A1', 2)).toBe('2');
      expect(generateScriptId('A1', 3)).toBe('3');
    });
  });

  describe('getAudioUrl', () => {
    const originalEnv = process.env.EXPO_PUBLIC_API_URL;

    beforeEach(() => {
      process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';
    });

    afterEach(() => {
      process.env.EXPO_PUBLIC_API_URL = originalEnv;
    });

    it('오디오 URL 생성', () => {
      const url = getAudioUrl('1', 1);
      expect(url).toBe('https://api.example.com/api/v1/initial-survey/A1/1');
    });

    it('다양한 레벨과 질문 번호로 URL 생성', () => {
      expect(getAudioUrl('2', 3)).toContain('/A2/3');
      expect(getAudioUrl('5', 2)).toContain('/C1/2');
    });
  });

  describe('submitLevelTest', () => {
    it('레벨 테스트 제출 성공', async () => {
      const levelId = '3';
      const percentages = [80, 75, 90, 85, 70];

      const mockResponse = {
        level: 'B1' as const,
        level_description: 'Intermediate level',
        scores: {
          level_score: 80,
          llm_confidence: 90,
        },
        rationale: 'Good understanding',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await submitLevelTest(levelId, percentages);

      expect(mockCustomFetch).toHaveBeenCalledWith('/level-system/level-test', {
        method: 'POST',
        body: expect.stringContaining('"level":"B1"'),
      });
      expect(result).toEqual(mockResponse);
    });

    it('모든 이해도가 높은 경우', async () => {
      const levelId = '6';
      const percentages = [95, 98, 100, 97, 99];

      const mockResponse = {
        level: 'C2' as const,
        level_description: 'Advanced level',
        scores: {
          level_score: 98,
          llm_confidence: 95,
        },
        rationale: 'Excellent comprehension',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await submitLevelTest(levelId, percentages);

      expect(result.level).toBe('C2');
      expect(result.scores.level_score).toBeGreaterThanOrEqual(90);
    });

    it('모든 이해도가 낮은 경우', async () => {
      const levelId = '1';
      const percentages = [10, 20, 15, 5, 30];

      const mockResponse = {
        level: 'A1' as const,
        level_description: 'Beginner level',
        scores: {
          level_score: 16,
          llm_confidence: 85,
        },
        rationale: 'Needs more practice',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await submitLevelTest(levelId, percentages);

      expect(result.level).toBe('A1');
      expect(result.scores.level_score).toBeLessThan(50);
    });

    it('레벨 테스트 제출 실패', async () => {
      const error = new Error('Failed to submit level test');
      mockCustomFetch.mockRejectedValue(error);

      await expect(submitLevelTest('3', [50, 60, 70])).rejects.toThrow(
        'Failed to submit level test',
      );
    });
  });

  describe('submitManualLevel', () => {
    it('수동 레벨 설정 성공', async () => {
      const levelId = '4';

      const mockResponse = {
        level: 'B2' as const,
        level_description: 'Upper intermediate',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await submitManualLevel(levelId);

      expect(mockCustomFetch).toHaveBeenCalledWith(
        '/level-system/manual-level',
        {
          method: 'POST',
          body: JSON.stringify({ level: 'B2' }),
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('각 레벨별 수동 설정', async () => {
      const levels = ['1', '2', '3', '4', '5', '6'];
      const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

      for (let i = 0; i < levels.length; i++) {
        const mockResponse = {
          level: cefrLevels[i],
          level_description: `Level ${cefrLevels[i]}`,
          updated_at: '2024-01-01T00:00:00Z',
        };

        mockCustomFetch.mockResolvedValue(mockResponse);

        const result = await submitManualLevel(levels[i]);
        expect(result.level).toBe(cefrLevels[i]);
      }
    });

    it('수동 레벨 설정 실패', async () => {
      const error = new Error('Failed to set manual level');
      mockCustomFetch.mockRejectedValue(error);

      await expect(submitManualLevel('3')).rejects.toThrow(
        'Failed to set manual level',
      );
    });
  });
});
