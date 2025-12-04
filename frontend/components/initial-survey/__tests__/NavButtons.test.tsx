import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import NavButtons from '../NavButtons';

describe('NavButtons', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders next button with custom label', () => {
    render(<NavButtons onNext={mockOnNext} nextLabel="다음" />);

    expect(screen.getByText('다음')).toBeTruthy();
  });

  it('calls onNext when next button is pressed', () => {
    render(<NavButtons onNext={mockOnNext} nextLabel="다음" />);

    const nextButton = screen.getByText('다음');
    fireEvent.press(nextButton);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('shows back button when showBackButton is true', () => {
    render(
      <NavButtons
        onNext={mockOnNext}
        onBack={mockOnBack}
        nextLabel="다음"
        showBackButton
      />,
    );

    expect(screen.getByText('이전')).toBeTruthy();
  });

  it('does not show back button by default', () => {
    render(<NavButtons onNext={mockOnNext} nextLabel="다음" />);

    expect(screen.queryByText('이전')).toBeNull();
  });

  it('calls onBack when back button is pressed', () => {
    render(
      <NavButtons
        onNext={mockOnNext}
        onBack={mockOnBack}
        nextLabel="다음"
        showBackButton
      />,
    );

    const backButton = screen.getByText('이전');
    fireEvent.press(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('uses custom back label', () => {
    render(
      <NavButtons
        onNext={mockOnNext}
        onBack={mockOnBack}
        nextLabel="다음"
        backLabel="뒤로"
        showBackButton
      />,
    );

    expect(screen.getByText('뒤로')).toBeTruthy();
  });

  it('renders next button when canProceed is false', () => {
    render(
      <NavButtons onNext={mockOnNext} nextLabel="다음" canProceed={false} />,
    );

    expect(screen.getByText('다음')).toBeTruthy();
  });

  it('does not call onNext when disabled', () => {
    render(
      <NavButtons onNext={mockOnNext} nextLabel="다음" canProceed={false} />,
    );

    const nextButton = screen.getByText('다음');
    fireEvent.press(nextButton);

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('renders next button when canProceed is true', () => {
    render(
      <NavButtons onNext={mockOnNext} nextLabel="다음" canProceed={true} />,
    );

    expect(screen.getByText('다음')).toBeTruthy();
  });
});
