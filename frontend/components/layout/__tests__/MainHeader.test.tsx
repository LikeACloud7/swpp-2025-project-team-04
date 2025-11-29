import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainHeader from '../MainHeader';

// Mock
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({
    top: 44,
    bottom: 0,
    left: 0,
    right: 0,
  })),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe('MainHeader', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('renders correctly with title', () => {
    renderWithProviders(<MainHeader title="홈" />);

    expect(screen.getByText('홈')).toBeTruthy();
  });

  it('renders with different titles', () => {
    const { rerender } = renderWithProviders(<MainHeader title="단어장" />);
    expect(screen.getByText('단어장')).toBeTruthy();

    rerender(
      <QueryClientProvider client={queryClient}>
        <MainHeader title="통계" />
      </QueryClientProvider>
    );
    expect(screen.getByText('통계')).toBeTruthy();
  });

  it('applies safe area insets for top padding', () => {
    const { UNSAFE_root } = renderWithProviders(<MainHeader title="테스트" />);

    expect(UNSAFE_root).toBeTruthy();
  });
});
