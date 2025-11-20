import {
  mockAuthToken,
  mockLoginResponse,
  mockSignupResponse,
  mockAudioContent,
  mockVocabData,
  mockStatsData,
  mockProfile,
} from './mockData';

type MockResponse = {
  status?: number;
  data?: any;
  delay?: number;
};

// fetch 응답 mock
export function mockFetchResponse(
  urlPattern: string,
  response: MockResponse,
  method: string = 'GET',
) {
  const originalFetch = global.fetch;

  global.fetch = jest.fn((url: string | URL | Request, init?: RequestInit) => {
    const urlString = url.toString();
    const requestMethod = init?.method?.toUpperCase() || 'GET';

    if (
      urlString.includes(urlPattern) &&
      requestMethod === method.toUpperCase()
    ) {
      return Promise.resolve({
        ok: (response.status || 200) < 400,
        status: response.status || 200,
        statusText: response.status === 401 ? 'Unauthorized' : 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => response.data,
        text: async () => JSON.stringify(response.data),
      } as Response);
    }

    return originalFetch(url as any, init);
  }) as jest.Mock;

  return global.fetch as jest.Mock;
}

// fetch 에러 mock
export function mockFetchError(
  urlPattern: string,
  error: { status: number; message: string },
  method: string = 'GET',
) {
  const originalFetch = global.fetch;

  global.fetch = jest.fn((url: string | URL | Request, init?: RequestInit) => {
    const urlString = url.toString();
    const requestMethod = init?.method?.toUpperCase() || 'GET';

    if (
      urlString.includes(urlPattern) &&
      requestMethod === method.toUpperCase()
    ) {
      return Promise.resolve({
        ok: false,
        status: error.status,
        statusText: error.message,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: error.message }),
        text: async () => JSON.stringify({ message: error.message }),
      } as Response);
    }

    return originalFetch(url as any, init);
  }) as jest.Mock;

  return global.fetch as jest.Mock;
}

export function mockLoginSuccess() {
  return mockFetchResponse(
    '/auth/login',
    {
      data: mockLoginResponse,
      status: 200,
    },
    'POST',
  );
}

export function mockLoginFailure(message = 'Invalid credentials') {
  return mockFetchError(
    '/auth/login',
    {
      status: 401,
      message,
    },
    'POST',
  );
}

export function mockSignupSuccess() {
  return mockFetchResponse(
    '/auth/signup',
    {
      data: mockSignupResponse,
      status: 201,
    },
    'POST',
  );
}

export function mockSignupFailure(message = 'Email already exists') {
  return mockFetchError(
    '/auth/signup',
    {
      status: 400,
      message,
    },
    'POST',
  );
}

export function mockGetProfile() {
  return mockFetchResponse('/user/profile', {
    data: mockProfile,
    status: 200,
  });
}

export function mockGetAudioContent(id: number = 1) {
  return mockFetchResponse(`/audio/${id}`, {
    data: mockAudioContent,
    status: 200,
  });
}

export function mockGetVocab(generatedContentId: number = 1) {
  return mockFetchResponse(`/vocab/${generatedContentId}`, {
    data: mockVocabData,
    status: 200,
  });
}

export function mockGetStats() {
  return mockFetchResponse('/stats', {
    data: mockStatsData,
    status: 200,
  });
}

export function mockAddVocab() {
  return mockFetchResponse(
    '/vocab',
    {
      data: { success: true, message: 'Vocabulary added' },
      status: 201,
    },
    'POST',
  );
}

export function mockSubmitFeedback() {
  return mockFetchResponse(
    '/feedback',
    {
      data: { success: true, message: 'Feedback submitted' },
      status: 201,
    },
    'POST',
  );
}

export function mockSubmitSurvey() {
  return mockFetchResponse(
    '/survey',
    {
      data: { success: true, redirect: '/home' },
      status: 201,
    },
    'POST',
  );
}

export function resetApiMocks() {
  jest.restoreAllMocks();
}
