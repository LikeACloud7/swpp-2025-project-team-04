import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import ExampleAudioButton from '../ExampleAudioButton';

// Mock expo-audio
const mockPlay = jest.fn();
const mockPause = jest.fn();
const mockSeekTo = jest.fn();
const mockReplace = jest.fn();

const mockPlayer = {
  play: mockPlay,
  pause: mockPause,
  seekTo: mockSeekTo,
  replace: mockReplace,
};

const mockStatus = {
  playing: false,
  duration: 100,
  currentTime: 0,
};

jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(),
  useAudioPlayerStatus: jest.fn(),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

describe('ExampleAudioButton', () => {
  const mockSetActiveId = jest.fn();
  const defaultProps = {
    id: 1,
    url: 'https://example.com/audio.mp3',
    player: mockPlayer as any,
    status: mockStatus as any,
    activeId: null,
    setActiveId: mockSetActiveId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
    mockPause.mockResolvedValue(undefined);
    mockSeekTo.mockResolvedValue(undefined);
    mockReplace.mockResolvedValue(undefined);
  });

  it('renders play button when not playing', () => {
    render(<ExampleAudioButton {...defaultProps} />);

    expect(screen.getByText('예문 듣기')).toBeTruthy();
  });

  it('renders stop button when playing', () => {
    render(
      <ExampleAudioButton
        {...defaultProps}
        activeId={1}
        status={{ ...mockStatus, playing: true } as any}
      />,
    );

    expect(screen.getByText('예문 종료')).toBeTruthy();
  });

  it('calls play when button is pressed for the first time', async () => {
    render(<ExampleAudioButton {...defaultProps} />);

    const button = screen.getByText('예문 듣기');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        uri: 'https://example.com/audio.mp3',
      });
      expect(mockPlay).toHaveBeenCalled();
      expect(mockSetActiveId).toHaveBeenCalledWith(1);
    });
  });

  it('shows loading indicator when loading', async () => {
    render(<ExampleAudioButton {...defaultProps} />);

    const button = screen.getByText('예문 듣기');
    fireEvent.press(button);

    expect(screen.queryByText('예문 듣기')).toBeNull();
  });

  it('stops and resets when stop button is pressed while playing', async () => {
    render(
      <ExampleAudioButton
        {...defaultProps}
        activeId={1}
        status={{ ...mockStatus, playing: true } as any}
      />,
    );

    const button = screen.getByText('예문 종료');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockPause).toHaveBeenCalled();
      expect(mockSeekTo).toHaveBeenCalledWith(0);
      expect(mockSetActiveId).toHaveBeenCalledWith(null);
    });
  });

  it('handles null player gracefully', () => {
    render(<ExampleAudioButton {...defaultProps} player={null} />);

    expect(screen.getByText('예문 듣기')).toBeTruthy();
  });

  it('does not play when player is null', () => {
    render(<ExampleAudioButton {...defaultProps} player={null} />);

    const button = screen.getByText('예문 듣기');
    fireEvent.press(button);

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('switches to new audio when different item is selected', async () => {
    const { rerender } = render(
      <ExampleAudioButton {...defaultProps} activeId={2} />,
    );

    const button = screen.getByText('예문 듣기');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        uri: 'https://example.com/audio.mp3',
      });
      expect(mockSetActiveId).toHaveBeenCalledWith(1);
    });
  });

  it('renders with different id', () => {
    render(<ExampleAudioButton {...defaultProps} id={5} />);

    expect(screen.getByText('예문 듣기')).toBeTruthy();
  });

  it('updates when activeId changes', () => {
    const { rerender } = render(<ExampleAudioButton {...defaultProps} />);

    expect(screen.getByText('예문 듣기')).toBeTruthy();

    rerender(
      <ExampleAudioButton
        {...defaultProps}
        activeId={1}
        status={{ ...mockStatus, playing: true } as any}
      />,
    );

    expect(screen.getByText('예문 종료')).toBeTruthy();
  });

  it('handles play error gracefully', async () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    mockReplace.mockRejectedValueOnce(new Error('Network error'));

    render(<ExampleAudioButton {...defaultProps} />);

    const button = screen.getByText('예문 듣기');
    fireEvent.press(button);

    await waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledWith(
        'Failed to play example audio',
        expect.any(Error),
      );
      expect(mockSetActiveId).toHaveBeenCalledWith(null);
    });

    consoleWarn.mockRestore();
  });

  it('resets player when paused item is pressed again', async () => {
    render(
      <ExampleAudioButton
        {...defaultProps}
        activeId={1}
        status={{ ...mockStatus, playing: false } as any}
      />,
    );

    const button = screen.getByText('예문 듣기');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockSeekTo).toHaveBeenCalledWith(0);
      expect(mockPlay).toHaveBeenCalled();
    });
  });
});
