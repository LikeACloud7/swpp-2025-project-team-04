import { act } from '@testing-library/react-native';

// Promise 해결 대기
export async function waitForPromises() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

// 특정 시간 대기
export async function wait(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

// 모든 pending promise flush
export async function flushPromises() {
  return act(async () => {
    await new Promise((resolve) => setImmediate(resolve));
  });
}

// 테스트 출력 깔끔하게
export function mockConsole() {
  const originalConsole = { ...console };

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  return originalConsole;
}

// 타입 안전한 mock 함수
export function createMockFn<
  T extends (...args: any[]) => any,
>(): jest.MockedFunction<T> {
  return jest.fn() as jest.MockedFunction<T>;
}

// 요소 나타날 때까지 대기
export async function waitForElement(
  callback: () => any,
  options: { timeout?: number; interval?: number } = {},
) {
  const { timeout = 4000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = callback();
      if (result) return result;
    } catch (error) {
      // 아직 없음, 계속 대기
    }
    await wait(interval);
  }

  throw new Error('Timeout waiting for element');
}

// expo-router navigation mock
export function createMockNavigation() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
    setParams: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
}

// expo-router search params mock
export function createMockSearchParams(params: Record<string, any> = {}) {
  return jest.fn(() => params);
}

// 파일 업로드 mock
export function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(['mock content'], { type });
  return new File([blob], name, { type });
}

// 부분 인자로 호출됐는지 확인
export function expectCalledWithPartial<T extends any[]>(
  mockFn: jest.Mock,
  ...partialArgs: Partial<T>
) {
  const calls = mockFn.mock.calls;
  const match = calls.some((call) =>
    partialArgs.every((arg, index) => {
      if (typeof arg === 'object' && arg !== null) {
        return Object.keys(arg).every((key) => call[index]?.[key] === arg[key]);
      }
      return call[index] === arg;
    }),
  );

  if (!match) {
    throw new Error(
      `Expected function to be called with partial args: ${JSON.stringify(partialArgs)}\nBut was called with: ${JSON.stringify(calls)}`,
    );
  }
}

// 지연 가능한 Promise
export function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}
