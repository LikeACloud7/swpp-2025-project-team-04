import { getVocab, addVocab, getMyVocab, deleteMyVocab } from '../vocab';
import { customFetch } from '../client';

jest.mock('../client');

const mockCustomFetch = customFetch as jest.MockedFunction<typeof customFetch>;

describe('vocab API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVocab', () => {
    it('학습 오디오별 vocab 조회 성공', async () => {
      const generatedContentId = 123;

      const mockResponse = {
        sentences: [
          {
            text: 'This is a test sentence.',
            index: 0,
            words: [
              { pos: 'pronoun', word: 'This', meaning: '이것' },
              { pos: 'verb', word: 'is', meaning: '~이다' },
              { pos: 'article', word: 'a', meaning: '하나의' },
              { pos: 'noun', word: 'test', meaning: '테스트' },
              { pos: 'noun', word: 'sentence', meaning: '문장' },
            ],
          },
        ],
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getVocab(generatedContentId);

      expect(mockCustomFetch).toHaveBeenCalledWith('/vocabs/123', {
        method: 'GET',
      });
      expect(result).toEqual(mockResponse);
      expect(result.sentences[0].words).toHaveLength(5);
    });

    it('빈 vocab 응답', async () => {
      const mockResponse = {
        sentences: [],
      };

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getVocab(456);

      expect(result.sentences).toEqual([]);
    });

    it('vocab 조회 실패', async () => {
      const error = new Error('Failed to fetch vocab');
      mockCustomFetch.mockRejectedValue(error);

      await expect(getVocab(123)).rejects.toThrow('Failed to fetch vocab');
    });
  });

  describe('addVocab', () => {
    it('단어 추가 성공', async () => {
      const generatedContentId = 123;
      const index = 0;
      const word = 'example';

      mockCustomFetch.mockResolvedValue(undefined);

      await addVocab(generatedContentId, index, word);

      expect(mockCustomFetch).toHaveBeenCalledWith('/vocabs/123/sentences/0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
    });

    it('여러 단어 순차 추가', async () => {
      const generatedContentId = 123;
      const words = ['word1', 'word2', 'word3'];

      mockCustomFetch.mockResolvedValue(undefined);

      for (let i = 0; i < words.length; i++) {
        await addVocab(generatedContentId, i, words[i]);
      }

      expect(mockCustomFetch).toHaveBeenCalledTimes(3);
    });

    it('단어 추가 실패', async () => {
      const error = new Error('Failed to add vocab');
      mockCustomFetch.mockRejectedValue(error);

      await expect(addVocab(123, 0, 'word')).rejects.toThrow(
        'Failed to add vocab',
      );
    });
  });

  describe('getMyVocab', () => {
    it('내 단어장 조회 성공', async () => {
      const mockResponse = [
        {
          id: 1,
          word: 'example',
          example_sentence: 'This is an example.',
          example_sentence_url: 'https://example.com/audio1.mp3',
          pos: 'noun',
          meaning: '예시',
        },
        {
          id: 2,
          word: 'test',
          example_sentence: 'This is a test.',
          example_sentence_url: 'https://example.com/audio2.mp3',
          pos: 'noun',
          meaning: '테스트',
        },
      ];

      mockCustomFetch.mockResolvedValue(mockResponse);

      const result = await getMyVocab();

      expect(mockCustomFetch).toHaveBeenCalledWith('/vocabs/me', {
        method: 'GET',
      });
      expect(result).toEqual(mockResponse);
      expect(result).toHaveLength(2);
    });

    it('빈 단어장', async () => {
      mockCustomFetch.mockResolvedValue([]);

      const result = await getMyVocab();

      expect(result).toEqual([]);
    });

    it('단어장 조회 실패', async () => {
      const error = new Error('Failed to fetch my vocab');
      mockCustomFetch.mockRejectedValue(error);

      await expect(getMyVocab()).rejects.toThrow('Failed to fetch my vocab');
    });
  });

  describe('deleteMyVocab', () => {
    it('단어 삭제 성공', async () => {
      const wordId = 123;

      mockCustomFetch.mockResolvedValue(undefined);

      await deleteMyVocab(wordId);

      expect(mockCustomFetch).toHaveBeenCalledWith('/vocabs/me/123', {
        method: 'DELETE',
      });
    });

    it('여러 단어 삭제', async () => {
      const wordIds = [1, 2, 3, 4, 5];

      mockCustomFetch.mockResolvedValue(undefined);

      for (const id of wordIds) {
        await deleteMyVocab(id);
      }

      expect(mockCustomFetch).toHaveBeenCalledTimes(5);
    });

    it('단어 삭제 실패', async () => {
      const error = new Error('Failed to delete vocab');
      mockCustomFetch.mockRejectedValue(error);

      await expect(deleteMyVocab(123)).rejects.toThrow(
        'Failed to delete vocab',
      );
    });

    it('존재하지 않는 단어 삭제', async () => {
      const error = new Error('Word not found');
      mockCustomFetch.mockRejectedValue(error);

      await expect(deleteMyVocab(999)).rejects.toThrow('Word not found');
    });
  });
});
