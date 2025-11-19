import type { Sentence } from '@/api/audio';

export const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  level: 'intermediate',
};

export const mockAuthToken = 'mock-jwt-token-12345';

export const mockLoginResponse = {
  token: mockAuthToken,
  user: mockUser,
};

export const mockSignupResponse = {
  token: mockAuthToken,
  user: mockUser,
};

export const mockSentences: Sentence[] = [
  { id: '1', start_time: '0.0', text: 'First sentence for testing' },
  { id: '2', start_time: '5.0', text: 'Second sentence follows' },
  { id: '3', start_time: '10.0', text: 'Third sentence here' },
];

export const mockAudioContent = {
  id: 1,
  title: 'Test Audio Content',
  duration: 180,
  level: 'intermediate',
  topic: 'technology',
  sentences: mockSentences,
};

export const mockVocabItem = {
  word: 'example',
  meaning: 'an instance serving for illustration',
  pos: 'noun',
  index: 0,
};

export const mockVocabList = [
  mockVocabItem,
  {
    word: 'test',
    meaning: 'a procedure to establish quality',
    pos: 'noun',
    index: 1,
  },
  {
    word: 'learn',
    meaning: 'to gain knowledge or skill',
    pos: 'verb',
    index: 2,
  },
];

export const mockVocabData = {
  generatedContentId: 1,
  sentences: [
    {
      index: 0,
      words: mockVocabList,
    },
  ],
};

export const mockSurveyData = {
  level: 'intermediate',
  topics: ['technology', 'business'],
  learningGoal: 'improve_conversation',
  studyTime: 30,
};

export const mockStatsData = {
  totalListeningTime: 3600,
  wordsLearned: 150,
  lessonsCompleted: 12,
  currentStreak: 7,
  level: 'intermediate',
  progress: {
    vocabulary: 75,
    listening: 80,
    comprehension: 70,
  },
};

export const mockInitialSurveyRequest = {
  level: 'intermediate',
  topics: ['technology', 'business', 'science'],
  learningGoal: 'exam_preparation',
};

export const mockFeedbackRequest = {
  generatedContentId: 1,
  rating: 5,
  comment: 'Great content, very helpful!',
  difficultyRating: 3,
};

export const mockProfile = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  level: 'intermediate',
  joinedDate: '2024-01-01',
  totalPoints: 1250,
  badges: ['early_bird', 'week_warrior', 'vocab_master'],
};

// 커스텀 문장 생성
export function createMockSentence(
  overrides?: Partial<Sentence>,
): Sentence {
  return {
    id: '1',
    start_time: '0.0',
    text: 'Mock sentence',
    ...overrides,
  };
}

// 여러 문장 생성
export function createMockSentences(count: number): Sentence[] {
  return Array.from({ length: count }, (_, i) =>
    createMockSentence({
      id: String(i + 1),
      start_time: String(i * 5),
      text: `Sentence number ${i + 1}`,
    }),
  );
}

// API 에러 응답
export function createMockError(message: string, status = 400) {
  return {
    response: {
      status,
      data: {
        message,
        error: message,
      },
    },
  };
}

// API 성공 응답
export function createMockSuccess<T>(data: T) {
  return {
    data,
    status: 200,
    statusText: 'OK',
  };
}
