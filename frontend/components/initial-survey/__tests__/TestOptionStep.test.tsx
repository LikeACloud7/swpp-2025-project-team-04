import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import TestOptionStep from '../TestOptionStep';

describe('TestOptionStep', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and description', () => {
    render(<TestOptionStep onSelect={mockOnSelect} />);

    expect(screen.getByText('듣기 테스트를 진행할까요?')).toBeTruthy();
    expect(
      screen.getByText(/더 정확한 레벨 측정을 위해 짧은 듣기 테스트를 권장합니다/),
    ).toBeTruthy();
  });

  it('renders both option buttons', () => {
    render(<TestOptionStep onSelect={mockOnSelect} />);

    expect(screen.getByText('테스트 진행하기')).toBeTruthy();
    expect(screen.getByText('건너뛰기')).toBeTruthy();
  });

  it('calls onSelect with false when "테스트 진행하기" is pressed', () => {
    render(<TestOptionStep onSelect={mockOnSelect} />);

    const testButton = screen.getByText('테스트 진행하기');
    fireEvent.press(testButton);

    expect(mockOnSelect).toHaveBeenCalledWith(false);
  });

  it('calls onSelect with true when "건너뛰기" is pressed', () => {
    render(<TestOptionStep onSelect={mockOnSelect} />);

    const skipButton = screen.getByText('건너뛰기');
    fireEvent.press(skipButton);

    expect(mockOnSelect).toHaveBeenCalledWith(true);
  });

  it('renders helper text', () => {
    render(<TestOptionStep onSelect={mockOnSelect} />);

    expect(
      screen.getByText('테스트를 건너뛰면 선택한 레벨을 기준으로 시작합니다.'),
    ).toBeTruthy();
  });

  it('allows selecting test option', () => {
    render(<TestOptionStep onSelect={mockOnSelect} />);

    const testButton = screen.getByText('테스트 진행하기');
    fireEvent.press(testButton);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('allows selecting skip option', () => {
    render(<TestOptionStep onSelect={mockOnSelect} />);

    const skipButton = screen.getByText('건너뛰기');
    fireEvent.press(skipButton);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('can change selection', () => {
    render(<TestOptionStep onSelect={mockOnSelect} />);

    const testButton = screen.getByText('테스트 진행하기');
    fireEvent.press(testButton);

    expect(mockOnSelect).toHaveBeenCalledWith(false);

    const skipButton = screen.getByText('건너뛰기');
    fireEvent.press(skipButton);

    expect(mockOnSelect).toHaveBeenCalledWith(true);
    expect(mockOnSelect).toHaveBeenCalledTimes(2);
  });
});
