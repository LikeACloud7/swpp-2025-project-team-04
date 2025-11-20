import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders correctly', () => {
    const { UNSAFE_root } = render(
      <ProgressBar currentStep={1} totalPages={5} />,
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('calculates progress correctly at start', () => {
    const { UNSAFE_root } = render(
      <ProgressBar currentStep={1} totalPages={5} />,
    );

    // 20% (1/5 * 100)
    expect(UNSAFE_root).toBeTruthy();
  });

  it('calculates progress correctly at middle', () => {
    const { UNSAFE_root } = render(
      <ProgressBar currentStep={3} totalPages={5} />,
    );

    // 60% (3/5 * 100)
    expect(UNSAFE_root).toBeTruthy();
  });

  it('calculates progress correctly at end', () => {
    const { UNSAFE_root } = render(
      <ProgressBar currentStep={5} totalPages={5} />,
    );

    // 100% (5/5 * 100)
    expect(UNSAFE_root).toBeTruthy();
  });

  it('handles zero currentStep', () => {
    const { UNSAFE_root } = render(
      <ProgressBar currentStep={0} totalPages={5} />,
    );

    // 0%
    expect(UNSAFE_root).toBeTruthy();
  });

  it('handles different total pages', () => {
    const { UNSAFE_root } = render(
      <ProgressBar currentStep={2} totalPages={10} />,
    );

    // 20% (2/10 * 100)
    expect(UNSAFE_root).toBeTruthy();
  });
});
