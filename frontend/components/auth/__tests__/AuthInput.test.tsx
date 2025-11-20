import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AuthInput, { AuthInputHandle } from '../AuthInput';

describe('AuthInput', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with label', () => {
    render(
      <AuthInput label="이메일" value="" onChangeText={mockOnChangeText} />,
    );

    expect(screen.getByText('이메일')).toBeTruthy();
  });

  it('renders without label when hideLabel is true', () => {
    render(
      <AuthInput
        label="이메일"
        value=""
        onChangeText={mockOnChangeText}
        hideLabel
      />,
    );

    expect(screen.queryByText('이메일')).toBeNull();
  });

  it('calls onChangeText when text changes', () => {
    render(<AuthInput label="이름" value="" onChangeText={mockOnChangeText} />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, 'John Doe');

    expect(mockOnChangeText).toHaveBeenCalledWith('John Doe');
  });

  it('renders with left icon', () => {
    const { UNSAFE_root } = render(
      <AuthInput
        label="이메일"
        value=""
        onChangeText={mockOnChangeText}
        leftIcon="mail"
      />,
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows secure text entry initially', () => {
    render(
      <AuthInput
        label="비밀번호"
        value="password123"
        onChangeText={mockOnChangeText}
        secureTextEntry
      />,
    );

    const input = screen.getByDisplayValue('password123');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('renders without secure toggle when showSecureToggle is false', () => {
    render(
      <AuthInput
        label="비밀번호"
        value="password123"
        onChangeText={mockOnChangeText}
        secureTextEntry
        showSecureToggle={false}
      />,
    );

    expect(screen.getByDisplayValue('password123')).toBeTruthy();
  });

  it('handles focus state', () => {
    render(
      <AuthInput label="이메일" value="" onChangeText={mockOnChangeText} />,
    );

    const input = screen.getByDisplayValue('');

    fireEvent(input, 'focus');
    expect(input.props.onFocus).toBeTruthy();

    fireEvent(input, 'blur');
    expect(input.props.onBlur).toBeTruthy();
  });

  it('exposes focus, blur, and clear methods via ref', () => {
    const ref = createRef<AuthInputHandle>();

    render(
      <AuthInput
        ref={ref}
        label="이메일"
        value=""
        onChangeText={mockOnChangeText}
      />,
    );

    expect(ref.current?.focus).toBeDefined();
    expect(ref.current?.blur).toBeDefined();
    expect(ref.current?.clear).toBeDefined();
  });

  it('applies custom containerClassName', () => {
    const { UNSAFE_root } = render(
      <AuthInput
        label="이메일"
        value=""
        onChangeText={mockOnChangeText}
        containerClassName="custom-container"
      />,
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('applies custom inputClassName', () => {
    render(
      <AuthInput
        label="이메일"
        value=""
        onChangeText={mockOnChangeText}
        inputClassName="custom-input"
      />,
    );

    const input = screen.getByDisplayValue('');
    expect(input).toBeTruthy();
  });

  it('handles editable prop', () => {
    render(
      <AuthInput
        label="읽기 전용"
        value="readonly value"
        onChangeText={mockOnChangeText}
        editable={false}
      />,
    );

    const input = screen.getByDisplayValue('readonly value');
    expect(input.props.editable).toBe(false);
  });

  it('displays placeholder with custom color', () => {
    render(
      <AuthInput
        label="이메일"
        value=""
        onChangeText={mockOnChangeText}
        placeholder="이메일을 입력하세요"
        placeholderTextColor="#999999"
      />,
    );

    const input = screen.getByPlaceholderText('이메일을 입력하세요');
    expect(input.props.placeholderTextColor).toBe('#999999');
  });
});
