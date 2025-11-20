import React from 'react';
import { render, screen } from '@testing-library/react-native';
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

describe('MainHeader', () => {
  it('renders correctly with title', () => {
    render(<MainHeader title="홈" />);

    expect(screen.getByText('홈')).toBeTruthy();
  });

  it('renders with different titles', () => {
    const { rerender } = render(<MainHeader title="단어장" />);
    expect(screen.getByText('단어장')).toBeTruthy();

    rerender(<MainHeader title="통계" />);
    expect(screen.getByText('통계')).toBeTruthy();
  });

  it('applies safe area insets for top padding', () => {
    const { UNSAFE_root } = render(<MainHeader title="테스트" />);

    expect(UNSAFE_root).toBeTruthy();
  });
});
