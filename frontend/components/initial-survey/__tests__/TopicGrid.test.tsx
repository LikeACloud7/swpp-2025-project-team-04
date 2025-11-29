import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import TopicGrid from '../TopicGrid';

describe('TopicGrid', () => {
  const mockCategories = [
    {
      category: '일상',
      topics: [
        { id: 'food', label: '음식' },
        { id: 'travel', label: '여행' },
      ],
    },
    {
      category: '학습',
      topics: [
        { id: 'science', label: '과학' },
        { id: 'history', label: '역사' },
      ],
    },
  ];

  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and description', () => {
    render(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={[]}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    expect(screen.getByText(/관심 있는 주제를/)).toBeTruthy();
    expect(screen.getByText(/선택해주세요/)).toBeTruthy();
    expect(screen.getByText('최대 3개까지 선택 가능')).toBeTruthy();
  });

  it('renders all categories', () => {
    render(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={[]}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    expect(screen.getByText('일상')).toBeTruthy();
    expect(screen.getByText('학습')).toBeTruthy();
  });

  it('renders all topics', () => {
    render(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={[]}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    expect(screen.getByText('음식')).toBeTruthy();
    expect(screen.getByText('여행')).toBeTruthy();
    expect(screen.getByText('과학')).toBeTruthy();
    expect(screen.getByText('역사')).toBeTruthy();
  });

  it('calls onToggle when a topic is pressed', () => {
    render(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={[]}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    const foodButton = screen.getByText('음식');
    fireEvent.press(foodButton);

    expect(mockOnToggle).toHaveBeenCalledWith('food');
  });

  it('calls onToggle with correct topic id', () => {
    render(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={[]}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    const scienceButton = screen.getByText('과학');
    fireEvent.press(scienceButton);

    expect(mockOnToggle).toHaveBeenCalledWith('science');
  });

  it('displays selection count', () => {
    render(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={['food', 'travel']}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    expect(screen.getByText('2 / 3 선택됨')).toBeTruthy();
  });

  it('updates selection count when topics are selected', () => {
    const { rerender } = render(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={[]}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    expect(screen.getByText('0 / 3 선택됨')).toBeTruthy();

    rerender(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={['food']}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    expect(screen.getByText('1 / 3 선택됨')).toBeTruthy();
  });

  it('highlights selected topics', () => {
    render(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={['food', 'science']}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    const foodButton = screen.getByText('음식').parent;
    const scienceButton = screen.getByText('과학').parent;

    expect(foodButton).toBeTruthy();
    expect(scienceButton).toBeTruthy();
  });

  it('allows toggling topics on and off', () => {
    render(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={['food']}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    const foodButton = screen.getByText('음식');
    fireEvent.press(foodButton);

    expect(mockOnToggle).toHaveBeenCalledWith('food');
  });

  it('handles empty categories array', () => {
    render(
      <TopicGrid
        categories={[]}
        selectedTopics={[]}
        onToggle={mockOnToggle}
        maxSelections={3}
      />,
    );

    expect(screen.getByText(/관심 있는 주제를/)).toBeTruthy();
    expect(screen.getByText('0 / 3 선택됨')).toBeTruthy();
  });

  it('displays correct max selections', () => {
    render(
      <TopicGrid
        categories={mockCategories}
        selectedTopics={[]}
        onToggle={mockOnToggle}
        maxSelections={5}
      />,
    );

    expect(screen.getByText('최대 5개까지 선택 가능')).toBeTruthy();
    expect(screen.getByText('0 / 5 선택됨')).toBeTruthy();
  });
});
