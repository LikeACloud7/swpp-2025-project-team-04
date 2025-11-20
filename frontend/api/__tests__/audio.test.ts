import { generateAudio } from '../audio';
import { customFetch } from '../client';

jest.mock('../client');

const mockCustomFetch = customFetch as jest.MockedFunction<typeof customFetch>;

describe('audio API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAudio', () => {
    it('오디오 생성 성공', async () => {
      const payload = {
        mood: 'happy',
        theme: 'technology',
      };

      const mockResponse = {
        generated_content_id: 123,
        title: 'Test Audio',
        audio_url: 'https://example.com/audio.mp3',
        sentences: [
          { id: '1', start_time: '0.0', text: 'First sentence' },
          { id: '2', start_time: '5.0', text: 'Second sentence' },
        ],
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await generateAudio(payload);

      expect(mockCustomFetch).toHaveBeenCalledWith('/audio/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockResponse);
      expect(result.sentences).toHaveLength(2);
    });

    it('빈 문장 배열로 응답', async () => {
      const payload = {
        mood: 'calm',
        theme: 'nature',
      };

      const mockResponse = {
        generated_content_id: 456,
        title: 'Empty Audio',
        audio_url: 'https://example.com/empty.mp3',
        sentences: [],
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await generateAudio(payload);

      expect(result.sentences).toEqual([]);
    });

    it('오디오 생성 실패', async () => {
      const payload = {
        mood: 'sad',
        theme: 'music',
      };

      const error = new Error('Failed to generate audio');
      mockCustomFetch.mockRejectedValue(error);

      await expect(generateAudio(payload)).rejects.toThrow(
        'Failed to generate audio',
      );
    });

    it('잘못된 파라미터로 요청', async () => {
      const payload = {
        mood: '',
        theme: '',
      };

      const error = new Error('Invalid parameters');
      mockCustomFetch.mockRejectedValue(error);

      await expect(generateAudio(payload)).rejects.toThrow(
        'Invalid parameters',
      );
    });
  });
});
