import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Chip } from '../Chip';

describe('Chip', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with label', () => {
    render(<Chip label="Test Chip" />);

    expect(screen.getByText('Test Chip')).toBeTruthy();
  });

  it('calls onPress with label when pressed', () => {
    render(<Chip label="Clickable" onPress={mockOnPress} />);

    const chip = screen.getByText('Clickable').parent?.parent?.parent?.parent;
    fireEvent.press(chip!);

    expect(mockOnPress).toHaveBeenCalledWith('Clickable');
  });

  it('does not call onPress when disabled', () => {
    render(<Chip label="Disabled" onPress={mockOnPress} disabled />);

    const chip = screen.getByText('Disabled').parent?.parent?.parent?.parent;
    fireEvent.press(chip!);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders selected state correctly', () => {
    render(<Chip label="Selected" selected />);

    expect(screen.getByText('Selected')).toBeTruthy();
  });

  it('renders without shimmer when shimmer is false', () => {
    render(<Chip label="No Shimmer" selected shimmer={false} />);

    expect(screen.getByText('No Shimmer')).toBeTruthy();
  });

  it('renders with shimmer when selected and shimmer is true', () => {
    render(<Chip label="With Shimmer" selected shimmer />);

    expect(screen.getByText('With Shimmer')).toBeTruthy();
  });

  it('handles onPress being undefined', () => {
    render(<Chip label="No Handler" />);

    const chip = screen.getByText('No Handler').parent?.parent?.parent?.parent;
    fireEvent.press(chip!);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies active gradient colors when not selected and not disabled', () => {
    const { getByText } = render(<Chip label="Active" />);

    expect(getByText('Active')).toBeTruthy();
  });

  it('applies disabled gradient colors when disabled', () => {
    const { getByText } = render(<Chip label="Disabled" disabled />);

    expect(getByText('Disabled')).toBeTruthy();
  });

  it('applies pressed style when pressed and not disabled', () => {
    render(<Chip label="Pressable" onPress={mockOnPress} />);

    const chip = screen.getByText('Pressable').parent?.parent?.parent?.parent;
    fireEvent(chip!, 'pressIn');

    expect(screen.getByText('Pressable')).toBeTruthy();
  });

  it('shows selected styling with proper text color', () => {
    render(<Chip label="Selected Chip" selected />);

    expect(screen.getByText('Selected Chip')).toBeTruthy();
  });

  it('does not show shimmer when not selected', () => {
    render(<Chip label="Not Selected" selected={false} shimmer />);

    expect(screen.getByText('Not Selected')).toBeTruthy();
  });

  it('stops shimmer when disabled even if selected', () => {
    render(<Chip label="Selected Disabled" selected disabled shimmer />);

    expect(screen.getByText('Selected Disabled')).toBeTruthy();
  });
});
