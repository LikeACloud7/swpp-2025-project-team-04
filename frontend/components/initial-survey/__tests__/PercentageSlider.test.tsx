import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PercentageSlider from '../PercentageSlider';

describe('PercentageSlider', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: 50,
    onChange: mockOnChange,
    fileNumber: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 기본 props로 올바르게 렌더링되는지 테스트
  it('renders correctly with default props', () => {
    render(<PercentageSlider {...defaultProps} />);

    expect(
      screen.getByText(/들은 내용 중 몇 %를 이해했는지/)
    ).toBeTruthy();
    expect(screen.getByText(/솔직하게 평가해 주세요./)).toBeTruthy();

    expect(screen.getByText('50%')).toBeTruthy();

    expect(screen.getByText('이해도')).toBeTruthy();

    expect(screen.getByText('0%')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
  });

  // 올바른 %값 표시되는지 테스트
  it('displays the correct percentage value', () => {
    const { rerender } = render(<PercentageSlider {...defaultProps} value={30} />);
    expect(screen.getByText('30%')).toBeTruthy();

    rerender(<PercentageSlider {...defaultProps} value={80} />);
    expect(screen.getByText('80%')).toBeTruthy();
  });

  // 슬라이더 컴포넌트 렌더링 테스트
  it('renders slider component', () => {
    render(<PercentageSlider {...defaultProps} />);

    const slider = screen.getByTestId('slider');
    expect(slider).toBeTruthy();
  });

  // 슬라이더 올바른 props 전달 테스트
  it('passes correct props to slider', () => {
    render(<PercentageSlider {...defaultProps} value={70} />);

    const slider = screen.getByTestId('slider');
    expect(slider.props.value).toBe(70);
    expect(slider.props.minimumValue).toBe(0);
    expect(slider.props.maximumValue).toBe(100);
    expect(slider.props.step).toBe(10);
  });

  // 다른 파일 번호를 받아들이는지 테스트
  it('accepts different file numbers', () => {
    const { rerender } = render(<PercentageSlider {...defaultProps} fileNumber={1} />);
    expect(screen.getByText('50%')).toBeTruthy();

    rerender(<PercentageSlider {...defaultProps} fileNumber={5} />);
    expect(screen.getByText('50%')).toBeTruthy();
  });
});
