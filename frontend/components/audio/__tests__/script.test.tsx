import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Script from '../script';
import { Sentence } from '@/api/audio';

// Mock
jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    seekTo: jest.fn(),
  },
  useProgress: jest.fn(() => ({ position: 0 })),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn((callback) => {
    const cleanup = callback();
    return cleanup;
  }),
}));

jest.mock('../Word', () => {
  const { Text, Pressable } = require('react-native');
  return function MockWord({ text, onPress, onLongPress }: any) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={() => onLongPress({ x: 0, y: 0, width: 100, height: 20 })}
      >
        <Text>{text}</Text>
      </Pressable>
    );
  };
});

jest.mock('@/hooks/queries/useVocabQueries', () => ({
  useVocab: jest.fn(() => ({
    data: {
      sentences: [
        {
          index: 0,
          words: [
            { word: 'hello', pos: 'int.', meaning: '안녕' },
            { word: 'world', pos: 'n.', meaning: '세계' },
          ],
        },
      ],
    },
  })),
}));

const mockMutate = jest.fn();
jest.mock('@/hooks/mutations/useVocabMutations', () => ({
  useAddVocab: jest.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

describe('Script', () => {
  const mockScripts: Sentence[] = [
    {
      id: 1,
      generated_content_id: 1,
      text: 'Hello world',
      start_time: '0.0',
      end_time: '2.0',
    },
    {
      id: 2,
      generated_content_id: 1,
      text: 'How are you',
      start_time: '2.5',
      end_time: '4.0',
    },
    {
      id: 3,
      generated_content_id: 1,
      text: 'I am fine',
      start_time: '4.5',
      end_time: '6.0',
    },
  ];

  const defaultProps = {
    generatedContentId: 1,
    scripts: mockScripts,
    onVocabLookup: jest.fn(),
    onVocabSave: jest.fn(),
    onRewind: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all script sentences', () => {
    render(<Script {...defaultProps} />);

    expect(screen.getByText('Hello')).toBeTruthy();
    expect(screen.getByText('world')).toBeTruthy();
    expect(screen.getByText('How')).toBeTruthy();
    expect(screen.getByText('are')).toBeTruthy();
    expect(screen.getByText('you')).toBeTruthy();
  });

  it('renders empty placeholder when text is empty', () => {
    const emptyScripts: Sentence[] = [
      {
        id: 1,
        generated_content_id: 1,
        text: '',
        start_time: '0.0',
        end_time: '2.0',
      },
    ];

    render(<Script {...defaultProps} scripts={emptyScripts} />);

    expect(screen.getByText('...')).toBeTruthy();
  });

  it('handles empty scripts array', () => {
    const { UNSAFE_root } = render(<Script {...defaultProps} scripts={[]} />);

    expect(UNSAFE_root).toBeTruthy();
  });

  it('splits text into individual words', () => {
    render(<Script {...defaultProps} />);

    //"Hello world"
    expect(screen.getByText('Hello')).toBeTruthy();
    expect(screen.getByText('world')).toBeTruthy();

    //"How are you"
    expect(screen.getByText('How')).toBeTruthy();
    expect(screen.getByText('are')).toBeTruthy();
    expect(screen.getByText('you')).toBeTruthy();
  });

  it('calls onVocabLookup when word is long pressed', () => {
    render(<Script {...defaultProps} />);

    const word = screen.getByText('Hello').parent;
    fireEvent(word!, 'longPress');

    expect(defaultProps.onVocabLookup).toHaveBeenCalled();
  });

  it('renders with different generatedContentId', () => {
    render(<Script {...defaultProps} generatedContentId={999} />);

    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('handles scripts with trimmed text', () => {
    const scriptsWithSpaces: Sentence[] = [
      {
        id: 1,
        generated_content_id: 1,
        text: '  Hello  world  ',
        start_time: '0.0',
        end_time: '2.0',
      },
    ];

    render(<Script {...defaultProps} scripts={scriptsWithSpaces} />);

    expect(screen.getByText('Hello')).toBeTruthy();
    expect(screen.getByText('world')).toBeTruthy();
  });

  it('handles undefined text gracefully', () => {
    const scriptsWithUndefined: Sentence[] = [
      {
        id: 1,
        generated_content_id: 1,
        text: undefined as any,
        start_time: '0.0',
        end_time: '2.0',
      },
    ];

    render(<Script {...defaultProps} scripts={scriptsWithUndefined} />);

    expect(screen.getByText('...')).toBeTruthy();
  });

  it('renders without optional callbacks', () => {
    const { UNSAFE_root } = render(
      <Script generatedContentId={1} scripts={mockScripts} />,
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('handles scripts with multiple words correctly', () => {
    const longScript: Sentence[] = [
      {
        id: 1,
        generated_content_id: 1,
        text: 'The quick brown fox jumps over the lazy dog',
        start_time: '0.0',
        end_time: '5.0',
      },
    ];

    render(<Script {...defaultProps} scripts={longScript} />);

    expect(screen.getByText('The')).toBeTruthy();
    expect(screen.getByText('quick')).toBeTruthy();
    expect(screen.getByText('brown')).toBeTruthy();
    expect(screen.getByText('fox')).toBeTruthy();
    expect(screen.getByText('jumps')).toBeTruthy();
  });

  it('renders scripts with single word', () => {
    const singleWordScript: Sentence[] = [
      {
        id: 1,
        generated_content_id: 1,
        text: 'Hello',
        start_time: '0.0',
        end_time: '1.0',
      },
    ];

    render(<Script {...defaultProps} scripts={singleWordScript} />);

    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
