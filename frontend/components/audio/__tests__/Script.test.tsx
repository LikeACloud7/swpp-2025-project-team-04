import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Script from '../script';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { Sentence } from '@/api/audio';
import { FlatList } from 'react-native';

jest.mock('react-native-track-player');
jest.spyOn(FlatList.prototype, 'scrollToIndex').mockImplementation(() => {});

describe('Script', () => {
  const mockUseProgress = useProgress as jest.MockedFunction<
    typeof useProgress
  >;
  const mockSeekTo = TrackPlayer.seekTo as jest.MockedFunction<
    typeof TrackPlayer.seekTo
  >;

  const mockScripts: Sentence[] = [
    { id: '1', start_time: '0.0', text: 'First sentence' },
    { id: '2', start_time: '5.0', text: 'Second sentence' },
    { id: '3', start_time: '10.0', text: 'Third sentence' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('renders all script sentences', () => {
      mockUseProgress.mockReturnValue({
        position: 0,
        duration: 20,
        buffered: 0,
      });

      render(<Script scripts={mockScripts} />);

      expect(screen.getByText('First sentence')).toBeTruthy();
      expect(screen.getByText('Second sentence')).toBeTruthy();
      expect(screen.getByText('Third sentence')).toBeTruthy();
    });

    it('renders empty script without crashing', () => {
      mockUseProgress.mockReturnValue({
        position: 0,
        duration: 0,
        buffered: 0,
      });

      expect(() => render(<Script scripts={[]} />)).not.toThrow();
    });

    it('renders ... for empty text', () => {
      const scriptsWithEmpty: Sentence[] = [
        { id: '1', start_time: '0.0', text: '' },
      ];
      mockUseProgress.mockReturnValue({
        position: 0,
        duration: 10,
        buffered: 0,
      });

      render(<Script scripts={scriptsWithEmpty} />);

      expect(screen.getByText('...')).toBeTruthy();
    });
  });

  describe('현재 라인 하이라이트', () => {
    it('highlights no line when position is before first sentence', () => {
      mockUseProgress.mockReturnValue({
        position: -1,
        duration: 20,
        buffered: 0,
      });

      const { UNSAFE_getAllByType } = render(<Script scripts={mockScripts} />);
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity,
      );

      // 하이라이트된 라인이 없어야 함
      touchables.forEach((touchable) => {
        const view = touchable.props.children;
        expect(view.props.className).not.toContain('border-primary');
      });
    });

    it('highlights first sentence when position is 0', () => {
      mockUseProgress.mockReturnValue({
        position: 0,
        duration: 20,
        buffered: 0,
      });

      render(<Script scripts={mockScripts} />);

      const firstSentence = screen.getByText('First sentence');
      expect(firstSentence.props.className).toContain('text-primary');
      expect(firstSentence.props.className).toContain('font-bold');
    });

    it('highlights second sentence when position is 5', () => {
      mockUseProgress.mockReturnValue({
        position: 5,
        duration: 20,
        buffered: 0,
      });

      render(<Script scripts={mockScripts} />);

      const secondSentence = screen.getByText('Second sentence');
      expect(secondSentence.props.className).toContain('text-primary');
      expect(secondSentence.props.className).toContain('font-bold');
    });

    it('highlights third sentence when position is 10', () => {
      mockUseProgress.mockReturnValue({
        position: 10,
        duration: 20,
        buffered: 0,
      });

      render(<Script scripts={mockScripts} />);

      const thirdSentence = screen.getByText('Third sentence');
      expect(thirdSentence.props.className).toContain('text-primary');
      expect(thirdSentence.props.className).toContain('font-bold');
    });

    it('highlights correct sentence when position is between timestamps', () => {
      mockUseProgress.mockReturnValue({
        position: 7.5,
        duration: 20,
        buffered: 0,
      });

      render(<Script scripts={mockScripts} />);

      const secondSentence = screen.getByText('Second sentence');
      expect(secondSentence.props.className).toContain('text-primary');
    });
  });

  describe('라인 클릭', () => {
    it('seeks to correct time when first sentence is clicked', () => {
      mockUseProgress.mockReturnValue({
        position: 0,
        duration: 20,
        buffered: 0,
      });

      render(<Script scripts={mockScripts} />);

      const firstSentence = screen.getByText('First sentence');
      fireEvent.press(firstSentence);

      expect(mockSeekTo).toHaveBeenCalledWith(0.0);
    });

    it('seeks to correct time when second sentence is clicked', () => {
      mockUseProgress.mockReturnValue({
        position: 0,
        duration: 20,
        buffered: 0,
      });

      render(<Script scripts={mockScripts} />);

      const secondSentence = screen.getByText('Second sentence');
      fireEvent.press(secondSentence);

      expect(mockSeekTo).toHaveBeenCalledWith(5.0);
    });

    it('seeks to correct time when third sentence is clicked', () => {
      mockUseProgress.mockReturnValue({
        position: 0,
        duration: 20,
        buffered: 0,
      });

      render(<Script scripts={mockScripts} />);

      const thirdSentence = screen.getByText('Third sentence');
      fireEvent.press(thirdSentence);

      expect(mockSeekTo).toHaveBeenCalledWith(10.0);
    });
  });

  describe('엣지 케이스', () => {
    it('handles fractional start times correctly', () => {
      const scriptsWithFractional: Sentence[] = [
        { id: '1', start_time: '0.5', text: 'Half second' },
        { id: '2', start_time: '3.75', text: 'Three point seven five' },
      ];
      mockUseProgress.mockReturnValue({
        position: 3.75,
        duration: 10,
        buffered: 0,
      });

      render(<Script scripts={scriptsWithFractional} />);

      const sentence = screen.getByText('Three point seven five');
      fireEvent.press(sentence);

      expect(mockSeekTo).toHaveBeenCalledWith(3.75);
    });

    it('handles single script sentence', () => {
      const singleScript: Sentence[] = [
        { id: '1', start_time: '0.0', text: 'Only sentence' },
      ];
      mockUseProgress.mockReturnValue({
        position: 0,
        duration: 5,
        buffered: 0,
      });

      render(<Script scripts={singleScript} />);

      expect(screen.getByText('Only sentence')).toBeTruthy();
    });
  });
});
