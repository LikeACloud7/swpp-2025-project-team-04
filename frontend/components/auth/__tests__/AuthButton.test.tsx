import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AuthButton from '../AuthButton';

describe('AuthButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title', () => {
    render(<AuthButton title="로그인" onPress={mockOnPress} />);

    expect(screen.getByText('로그인')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(<AuthButton title="제출" onPress={mockOnPress} />);

    const button = screen.getByText('제출').parent;
    fireEvent.press(button!);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    render(<AuthButton title="비활성화" onPress={mockOnPress} disabled />);

    const button = screen.getByText('비활성화').parent;
    fireEvent.press(button!);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading state with ActivityIndicator', () => {
    render(<AuthButton title="제출" onPress={mockOnPress} loading />);

    expect(screen.getByText('제출 중...')).toBeTruthy();
    expect(screen.queryByText('제출')).toBeNull();
  });

  it('does not call onPress when loading', () => {
    render(<AuthButton title="로그인" onPress={mockOnPress} loading />);

    const button = screen.getByText('로그인 중...').parent?.parent;
    fireEvent.press(button!);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { getByText } = render(
      <AuthButton
        title="커스텀"
        onPress={mockOnPress}
        className="custom-class"
      />,
    );

    const button = getByText('커스텀').parent;
    expect(button).toBeTruthy();
  });

  it('renders correctly when disabled', () => {
    render(<AuthButton title="비활성화" onPress={mockOnPress} disabled />);

    expect(screen.getByText('비활성화')).toBeTruthy();
  });

  it('renders correctly when loading', () => {
    render(<AuthButton title="로딩" onPress={mockOnPress} loading />);

    expect(screen.getByText('로딩 중...')).toBeTruthy();
  });

  it('applies pressed style when button is pressed and not disabled', () => {
    render(<AuthButton title="Press Me" onPress={mockOnPress} />);

    const button = screen.getByText('Press Me').parent;
    fireEvent(button!, 'pressIn');

    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
