import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 버튼이랑 타이틀 같이 렌더링되는지 테스트
  it('renders correctly with title', () => {
    render(<Button title="Click Me" onPress={mockOnPress} />);

    const buttonText = screen.getByText('Click Me');
    expect(buttonText).toBeTruthy();
  });

  // 버튼 클릭 onPress 콜백 호출 테스트
  it('calls onPress when pressed', () => {
    render(<Button title="Test Button" onPress={mockOnPress} />);

    const button = screen.getByText('Test Button').parent;
    fireEvent.press(button!);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  // 비활성화된 버튼 onPress가 호출되지 않는지 테스트
  it('does not call onPress when disabled', () => {
    render(<Button title="Disabled Button" onPress={mockOnPress} disabled />);

    const button = screen.getByText('Disabled Button').parent;
    fireEvent.press(button!);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  // 활성화된 상태에서 렌더링 테스트
  it('renders correctly when enabled', () => {
    render(<Button title="Enabled" onPress={mockOnPress} />);

    expect(screen.getByText('Enabled')).toBeTruthy();
  });

  // 비활성화된 상태에서 렌더링 테스트
  it('renders correctly when disabled', () => {
    render(<Button title="Disabled" onPress={mockOnPress} disabled />);

    expect(screen.getByText('Disabled')).toBeTruthy();
  });

  // 커스텀 스타일 적용 테스트
  it('accepts custom style prop without crashing', () => {
    const customStyle = { width: 200, height: 50 };

    expect(() =>
      render(
        <Button
          title="Custom Style"
          onPress={mockOnPress}
          style={customStyle}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByText('Custom Style')).toBeTruthy();
  });

  // 텍스트 스타일 올바르게 적용되는지 테스트
  it('has correct text styling', () => {
    render(<Button title="Text Style Test" onPress={mockOnPress} />);

    const text = screen.getByText('Text Style Test');
    expect(text.props.style).toEqual(
      expect.objectContaining({
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
      }),
    );
  });
});
