import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GradientButton } from '../GradientButton';

describe('GradientButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title', () => {
    render(<GradientButton title="Click Me" onPress={mockOnPress} />);

    const buttonText = screen.getByText('Click Me');
    expect(buttonText).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(<GradientButton title="Test Button" onPress={mockOnPress} />);

    const button = screen.getByText('Test Button').parent;
    fireEvent.press(button!);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    render(
      <GradientButton title="Disabled Button" onPress={mockOnPress} disabled />,
    );

    const button = screen.getByText('Disabled Button').parent?.parent;
    fireEvent.press(button!);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<GradientButton title="Submit" onPress={mockOnPress} loading />);

    expect(screen.getByText('생성 중...')).toBeTruthy();
    expect(screen.queryByText('Submit')).toBeNull();
  });

  it('renders with icon when provided', () => {
    render(
      <GradientButton
        title="Play Music"
        icon="play"
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByText('Play Music')).toBeTruthy();
  });

  it('does not call onPress when loading', () => {
    render(
      <GradientButton title="Loading" onPress={mockOnPress} loading />,
    );

    const button = screen.getByText('생성 중...').parent?.parent;
    fireEvent.press(button!);

    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
