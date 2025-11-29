import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import LevelSelector from '../LevelSelector';

describe('LevelSelector', () => {
  const mockLevels = [
    { id: 'beginner', title: '초급' },
    { id: 'intermediate', title: '중급' },
    { id: 'advanced', title: '고급' },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all level options', () => {
    render(
      <LevelSelector
        levels={mockLevels}
        selectedLevel=""
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText('초급')).toBeTruthy();
    expect(screen.getByText('중급')).toBeTruthy();
    expect(screen.getByText('고급')).toBeTruthy();
  });

  it('renders title and description', () => {
    render(
      <LevelSelector
        levels={mockLevels}
        selectedLevel=""
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText(/영어 듣기 실력은/)).toBeTruthy();
    expect(screen.getByText(/어느 정도인가요?/)).toBeTruthy();
    expect(
      screen.getByText('가장 정확하다고 생각하는 레벨을 선택해 주세요'),
    ).toBeTruthy();
  });

  it('calls onSelect when a level is pressed', () => {
    render(
      <LevelSelector
        levels={mockLevels}
        selectedLevel=""
        onSelect={mockOnSelect}
      />,
    );

    const beginnerButton = screen.getByText('초급');
    fireEvent.press(beginnerButton);

    expect(mockOnSelect).toHaveBeenCalledWith('beginner');
  });

  it('calls onSelect with correct level id', () => {
    render(
      <LevelSelector
        levels={mockLevels}
        selectedLevel=""
        onSelect={mockOnSelect}
      />,
    );

    const advancedButton = screen.getByText('고급');
    fireEvent.press(advancedButton);

    expect(mockOnSelect).toHaveBeenCalledWith('advanced');
  });

  it('highlights selected level', () => {
    render(
      <LevelSelector
        levels={mockLevels}
        selectedLevel="intermediate"
        onSelect={mockOnSelect}
      />,
    );

    const intermediateButton = screen.getByText('중급').parent;
    expect(intermediateButton).toBeTruthy();
  });

  it('allows changing selection', () => {
    const { rerender } = render(
      <LevelSelector
        levels={mockLevels}
        selectedLevel="beginner"
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText('초급')).toBeTruthy();

    rerender(
      <LevelSelector
        levels={mockLevels}
        selectedLevel="advanced"
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText('고급')).toBeTruthy();
  });

  it('renders empty levels array', () => {
    render(
      <LevelSelector levels={[]} selectedLevel="" onSelect={mockOnSelect} />,
    );

    expect(screen.getByText('영어 듣기 실력은 어느 정도인가요?')).toBeTruthy();
  });
});
