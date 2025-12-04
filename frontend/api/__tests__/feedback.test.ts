import { submitFeedback } from '../feedback';
import { customFetch } from '../client';

jest.mock('../client');

const mockCustomFetch = customFetch as jest.MockedFunction<typeof customFetch>;

describe('feedback API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('피드백 제출 성공', async () => {
      const payload = {
        generated_content_id: 123,
        pause_cnt: 5,
        rewind_cnt: 3,
        vocab_lookup_cnt: 10,
        vocab_save_cnt: 7,
        understanding_difficulty: 3,
        speed_difficulty: 4,
      };

      const mockResponse = {
        lexical_level: 5,
        syntactic_level: 4,
        speed_level: 6,
        lexical_level_delta: 1,
        syntactic_level_delta: 0,
        speed_level_delta: -1,
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await submitFeedback(payload);

      expect(mockCustomFetch).toHaveBeenCalledWith(
        '/level-system/session-feedback',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('모든 카운트가 0인 피드백', async () => {
      const payload = {
        generated_content_id: 456,
        pause_cnt: 0,
        rewind_cnt: 0,
        vocab_lookup_cnt: 0,
        vocab_save_cnt: 0,
        understanding_difficulty: 1,
        speed_difficulty: 1,
      };

      const mockResponse = {
        lexical_level: 3,
        syntactic_level: 3,
        speed_level: 3,
        lexical_level_delta: 0,
        syntactic_level_delta: 0,
        speed_level_delta: 0,
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await submitFeedback(payload);

      expect(result).toEqual(mockResponse);
    });

    it('높은 난이도로 피드백 제출', async () => {
      const payload = {
        generated_content_id: 789,
        pause_cnt: 20,
        rewind_cnt: 15,
        vocab_lookup_cnt: 30,
        vocab_save_cnt: 25,
        understanding_difficulty: 5,
        speed_difficulty: 5,
      };

      const mockResponse = {
        lexical_level: 2,
        syntactic_level: 2,
        speed_level: 2,
        lexical_level_delta: -2,
        syntactic_level_delta: -2,
        speed_level_delta: -3,
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await submitFeedback(payload);

      expect(result.lexical_level_delta).toBeLessThan(0);
      expect(result.syntactic_level_delta).toBeLessThan(0);
      expect(result.speed_level_delta).toBeLessThan(0);
    });

    it('피드백 제출 실패', async () => {
      const payload = {
        generated_content_id: 123,
        pause_cnt: 5,
        rewind_cnt: 3,
        vocab_lookup_cnt: 10,
        vocab_save_cnt: 7,
        understanding_difficulty: 3,
        speed_difficulty: 4,
      };

      const error = new Error('Failed to submit feedback');
      mockCustomFetch.mockRejectedValue(error);

      await expect(submitFeedback(payload)).rejects.toThrow(
        'Failed to submit feedback',
      );
    });
  });
});
