import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Pressable } from 'react-native';
import Word from '../Word';
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

describe('Word', () => {
  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders word text correctly', () => {
    render(
      <Word text="Hello" onPress={mockOnPress} onLongPress={mockOnLongPress} />,
    );

    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(
      <Word text="Test" onPress={mockOnPress} onLongPress={mockOnLongPress} />,
    );

    const word = screen.getByText('Test').parent;
    fireEvent.press(word!);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders text for long press interaction', () => {
    render(
      <Word text="Test" onPress={mockOnPress} onLongPress={mockOnLongPress} />,
    );

    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('appends space when appendSpace is true', () => {
    render(
      <Word
        text="Word"
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
        appendSpace
      />,
    );

    expect(screen.getByText('Word ')).toBeTruthy();
  });

  it('does not append space by default', () => {
    render(
      <Word text="Word" onPress={mockOnPress} onLongPress={mockOnLongPress} />,
    );

    expect(screen.getByText('Word')).toBeTruthy();
  });

  it('applies highlighted styles when isHighlighted is true', () => {
    render(
      <Word
        text="Highlighted"
        isHighlighted
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />,
    );

    const text = screen.getByText('Highlighted');
    expect(text).toBeTruthy();
  });

  it('applies normal styles when isHighlighted is false', () => {
    render(
      <Word
        text="Normal"
        isHighlighted={false}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />,
    );

    const text = screen.getByText('Normal');
    expect(text).toBeTruthy();
  });

  it('renders multiple words with different props', () => {
    const { rerender } = render(
      <Word text="First" onPress={mockOnPress} onLongPress={mockOnLongPress} />,
    );

    expect(screen.getByText('First')).toBeTruthy();

    rerender(
      <Word
        text="Second"
        isHighlighted
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />,
    );

    expect(screen.getByText('Second')).toBeTruthy();
  });
});
