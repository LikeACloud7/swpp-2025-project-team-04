import { getAudioHistory } from '../audioHistory';
import { customFetch } from '../client';

jest.mock('../client');

const mockCustomFetch = customFetch as jest.MockedFunction<typeof customFetch>;

describe('audioHistory API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAudioHistory', () => {
    it('오디오 히스토리 조회 성공 - 기본 파라미터', async () => {
      const mockResponse = {
        items: [
          {
            generated_content_id: 1,
            user_id: 100,
            title: 'Audio 1',
            audio_url: 'https://example.com/audio1.mp3',
            script_data: 'script 1',
            sentences: [
              { id: 1, start_time: 0, text: 'First sentence' },
              { id: 2, start_time: 5, text: 'Second sentence' },
            ],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getAudioHistory();

      expect(mockCustomFetch).toHaveBeenCalledWith(
        '/audio/history?limit=20&offset=0',
        {
          method: 'GET',
        },
      );
      expect(result).toEqual(mockResponse);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('오디오 히스토리 조회 성공 - 커스텀 limit', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        limit: 10,
        offset: 0,
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getAudioHistory({ limit: 10 });

      expect(mockCustomFetch).toHaveBeenCalledWith(
        '/audio/history?limit=10&offset=0',
        {
          method: 'GET',
        },
      );
      expect(result.limit).toBe(10);
    });

    it('오디오 히스토리 조회 성공 - 커스텀 offset', async () => {
      const mockResponse = {
        items: [
          {
            generated_content_id: 21,
            user_id: 100,
            title: 'Audio 21',
            audio_url: 'https://example.com/audio21.mp3',
            script_data: 'script 21',
            sentences: [],
            created_at: '2024-01-21T00:00:00Z',
            updated_at: '2024-01-21T00:00:00Z',
          },
        ],
        total: 50,
        limit: 20,
        offset: 20,
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getAudioHistory({ offset: 20 });

      expect(mockCustomFetch).toHaveBeenCalledWith(
        '/audio/history?limit=20&offset=20',
        {
          method: 'GET',
        },
      );
      expect(result.offset).toBe(20);
    });

    it('오디오 히스토리 조회 성공 - limit와 offset 모두 커스텀', async () => {
      const mockResponse = {
        items: [],
        total: 100,
        limit: 5,
        offset: 50,
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getAudioHistory({ limit: 5, offset: 50 });

      expect(mockCustomFetch).toHaveBeenCalledWith(
        '/audio/history?limit=5&offset=50',
        {
          method: 'GET',
        },
      );
      expect(result.limit).toBe(5);
      expect(result.offset).toBe(50);
    });

    it('빈 히스토리 배열 응답', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getAudioHistory();

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('여러 개의 오디오 아이템 응답', async () => {
      const mockResponse = {
        items: [
          {
            generated_content_id: 1,
            user_id: 100,
            title: 'Audio 1',
            audio_url: 'https://example.com/audio1.mp3',
            script_data: 'script 1',
            sentences: [{ id: 1, start_time: 0, text: 'Sentence 1' }],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            generated_content_id: 2,
            user_id: 100,
            title: 'Audio 2',
            audio_url: 'https://example.com/audio2.mp3',
            script_data: 'script 2',
            sentences: [{ id: 2, start_time: 0, text: 'Sentence 2' }],
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
          },
          {
            generated_content_id: 3,
            user_id: 100,
            title: 'Audio 3',
            audio_url: 'https://example.com/audio3.mp3',
            script_data: 'script 3',
            sentences: [],
            created_at: '2024-01-03T00:00:00Z',
            updated_at: '2024-01-03T00:00:00Z',
          },
        ],
        total: 3,
        limit: 20,
        offset: 0,
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getAudioHistory();

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.items[0].generated_content_id).toBe(1);
      expect(result.items[1].generated_content_id).toBe(2);
      expect(result.items[2].generated_content_id).toBe(3);
    });

    it('API 에러 처리', async () => {
      const error = new Error('Failed to fetch audio history');
      mockCustomFetch.mockRejectedValue(error);

      await expect(getAudioHistory()).rejects.toThrow(
        'Failed to fetch audio history',
      );
    });
  });
});
