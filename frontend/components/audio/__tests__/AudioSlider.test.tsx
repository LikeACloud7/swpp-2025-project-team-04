import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AudioSlider from '../AudioSlider';
import TrackPlayer, { useProgress } from 'react-native-track-player';

jest.mock('react-native-track-player');

describe('AudioSlider', () => {
  const mockUseProgress = useProgress as jest.MockedFunction<
    typeof useProgress
  >;
  const mockSeekTo = TrackPlayer.seekTo as jest.MockedFunction<
    typeof TrackPlayer.seekTo
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('renders slider with correct initial values', () => {
      mockUseProgress.mockReturnValue({ position: 0, duration: 100 });

      const { UNSAFE_getByType } = render(<AudioSlider />);
      const slider = UNSAFE_getByType(
        require('@react-native-community/slider').default,
      );

      expect(slider.props.value).toBe(0);
      expect(slider.props.minimumValue).toBe(0);
      expect(slider.props.maximumValue).toBe(100);
    });

    it('renders slider with current progress', () => {
      mockUseProgress.mockReturnValue({ position: 45, duration: 180 });

      const { UNSAFE_getByType } = render(<AudioSlider />);
      const slider = UNSAFE_getByType(
        require('@react-native-community/slider').default,
      );

      expect(slider.props.value).toBe(45);
      expect(slider.props.maximumValue).toBe(180);
    });

    it('renders slider with maximumValue 0 when duration is 0', () => {
      mockUseProgress.mockReturnValue({ position: 0, duration: 0 });

      const { UNSAFE_getByType } = render(<AudioSlider />);
      const slider = UNSAFE_getByType(
        require('@react-native-community/slider').default,
      );

      expect(slider.props.maximumValue).toBe(0);
      expect(slider.props.disabled).toBe(true);
    });
  });

  describe('시간 표시', () => {
    it('formats time correctly for position 0:00', () => {
      mockUseProgress.mockReturnValue({ position: 0, duration: 100 });

      render(<AudioSlider />);

      expect(screen.getByText('0:00')).toBeTruthy();
    });

    it('formats time correctly for position under 10 seconds', () => {
      mockUseProgress.mockReturnValue({ position: 5, duration: 100 });

      render(<AudioSlider />);

      expect(screen.getByText('0:05')).toBeTruthy();
    });

    it('formats time correctly for position over 60 seconds', () => {
      mockUseProgress.mockReturnValue({ position: 65, duration: 180 });

      render(<AudioSlider />);

      expect(screen.getByText('1:05')).toBeTruthy();
    });

    it('formats time correctly for duration', () => {
      mockUseProgress.mockReturnValue({ position: 0, duration: 125 });

      render(<AudioSlider />);

      expect(screen.getByText('2:05')).toBeTruthy();
    });

    it('displays both current time and duration', () => {
      mockUseProgress.mockReturnValue({ position: 45, duration: 180 });

      render(<AudioSlider />);

      expect(screen.getByText('0:45')).toBeTruthy();
      expect(screen.getByText('3:00')).toBeTruthy();
    });

    it('handles non-finite values (Infinity)', () => {
      mockUseProgress.mockReturnValue({ position: Infinity, duration: 100 });

      render(<AudioSlider />);

      expect(screen.getByText('0:00')).toBeTruthy();
    });

    it('handles non-finite values (NaN)', () => {
      mockUseProgress.mockReturnValue({ position: NaN, duration: 100 });

      render(<AudioSlider />);

      expect(screen.getByText('0:00')).toBeTruthy();
    });
  });

  describe('슬라이더 동작', () => {
    it('calls TrackPlayer.seekTo when sliding is complete', async () => {
      mockUseProgress.mockReturnValue({ position: 0, duration: 100 });
      mockSeekTo.mockResolvedValue(undefined);

      const { UNSAFE_getByType } = render(<AudioSlider />);
      const slider = UNSAFE_getByType(
        require('@react-native-community/slider').default,
      );

      await slider.props.onSlidingComplete(50);

      expect(mockSeekTo).toHaveBeenCalledWith(50);
    });

    it('seeks to correct position when user drags slider', async () => {
      mockUseProgress.mockReturnValue({ position: 30, duration: 200 });
      mockSeekTo.mockResolvedValue(undefined);

      const { UNSAFE_getByType } = render(<AudioSlider />);
      const slider = UNSAFE_getByType(
        require('@react-native-community/slider').default,
      );

      await slider.props.onSlidingComplete(120);

      expect(mockSeekTo).toHaveBeenCalledWith(120);
    });
  });

  describe('스타일링', () => {
    it('has correct track and thumb colors', () => {
      mockUseProgress.mockReturnValue({ position: 0, duration: 100 });

      const { UNSAFE_getByType } = render(<AudioSlider />);
      const slider = UNSAFE_getByType(
        require('@react-native-community/slider').default,
      );

      expect(slider.props.minimumTrackTintColor).toBe('rgba(255,255,255,0.95)');
      expect(slider.props.maximumTrackTintColor).toBe('rgba(255,255,255,0.28)');
      expect(slider.props.thumbTintColor).toBe('rgba(255,255,255,0.98)');
    });
  });
});
