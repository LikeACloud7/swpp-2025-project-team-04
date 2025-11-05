// import React from 'react';
// import { render, screen, fireEvent, act } from '@testing-library/react-native';
// import Script from '../script';
// import Word from '../word';
// import TrackPlayer, { useProgress } from 'react-native-track-player';
// import { Sentence } from '@/api/audio';
// import { FlatList } from 'react-native';

// jest.mock('react-native-track-player');
// jest.spyOn(FlatList.prototype, 'scrollToIndex').mockImplementation(() => {});

// describe('Script', () => {
//   const mockUseProgress = useProgress as jest.MockedFunction<
//     typeof useProgress
//   >;
//   const mockSeekTo = TrackPlayer.seekTo as jest.MockedFunction<
//     typeof TrackPlayer.seekTo
//   >;

//   const mockScripts: Sentence[] = [
//     { id: '1', start_time: '0.0', text: 'First sentence' },
//     { id: '2', start_time: '5.0', text: 'Second sentence' },
//     { id: '3', start_time: '10.0', text: 'Third sentence' },
//   ];

//   const getWordPressable = (sentenceId: string, wordIndex: number) =>
//     screen.getByTestId(`word-${sentenceId}-${wordIndex}`);

//   const getWordTextNode = (sentenceId: string, wordIndex: number) => {
//     const pressable = getWordPressable(sentenceId, wordIndex);
//     const child = pressable.props.children;

//     if (Array.isArray(child)) {
//       return child.find(
//         (node: React.ReactNode) =>
//           !!node &&
//           typeof node === 'object' &&
//           'props' in node &&
//           node.props?.children !== undefined,
//       );
//     }

//     return child;
//   };

//   const getWordText = (sentenceId: string, wordIndex: number) => {
//     const node = getWordTextNode(sentenceId, wordIndex);
//     const children = node?.props?.children;

//     if (Array.isArray(children)) {
//       return children.join('').trim();
//     }

//     return typeof children === 'string' ? children.trim() : '';
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('렌더링', () => {
//     it('renders all script sentences', () => {
//       mockUseProgress.mockReturnValue({
//         position: 0,
//         duration: 20,
//         buffered: 0,
//       });

//       render(<Script scripts={mockScripts} />);

//       expect(getWordText('1', 0)).toBe('First');
//       expect(getWordText('1', 1)).toBe('sentence');
//       expect(getWordText('2', 0)).toBe('Second');
//       expect(getWordText('2', 1)).toBe('sentence');
//       expect(getWordText('3', 0)).toBe('Third');
//       expect(getWordText('3', 1)).toBe('sentence');
//     });

//     it('renders empty script without crashing', () => {
//       mockUseProgress.mockReturnValue({
//         position: 0,
//         duration: 0,
//         buffered: 0,
//       });

//       expect(() => render(<Script scripts={[]} />)).not.toThrow();
//     });

//     it('renders ... for empty text', () => {
//       const scriptsWithEmpty: Sentence[] = [
//         { id: '1', start_time: '0.0', text: '' },
//       ];
//       mockUseProgress.mockReturnValue({
//         position: 0,
//         duration: 10,
//         buffered: 0,
//       });

//       render(<Script scripts={scriptsWithEmpty} />);

//       expect(screen.getByText('...')).toBeTruthy();
//     });
//   });

//   describe('현재 라인 하이라이트', () => {
//     it('highlights no line when position is before first sentence', () => {
//       mockUseProgress.mockReturnValue({
//         position: -1,
//         duration: 20,
//         buffered: 0,
//       });

//       render(<Script scripts={mockScripts} />);

//       mockScripts.forEach((sentence) => {
//         const words = sentence.text.split(/\s+/);
//         words.forEach((_, wordIndex) => {
//           const wordTextNode = getWordTextNode(sentence.id, wordIndex);
//           expect(wordTextNode?.props?.className ?? '').not.toContain(
//             'text-blue-600',
//           );
//         });
//       });
//     });

//     it('highlights first sentence when position is 0', () => {
//       mockUseProgress.mockReturnValue({
//         position: 0,
//         duration: 20,
//         buffered: 0,
//       });

//       render(<Script scripts={mockScripts} />);

//       const firstWord = getWordTextNode('1', 0);
//       expect(firstWord?.props?.className).toContain('text-blue-600');
//       expect(firstWord?.props?.className).toContain('font-bold');
//     });

//     it('highlights second sentence when position is 5', () => {
//       mockUseProgress.mockReturnValue({
//         position: 5,
//         duration: 20,
//         buffered: 0,
//       });

//       render(<Script scripts={mockScripts} />);

//       const secondWord = getWordTextNode('2', 0);
//       expect(secondWord?.props?.className).toContain('text-blue-600');
//       expect(secondWord?.props?.className).toContain('font-bold');
//     });

//     it('highlights third sentence when position is 10', () => {
//       mockUseProgress.mockReturnValue({
//         position: 10,
//         duration: 20,
//         buffered: 0,
//       });

//       render(<Script scripts={mockScripts} />);

//       const thirdWord = getWordTextNode('3', 0);
//       expect(thirdWord?.props?.className).toContain('text-blue-600');
//       expect(thirdWord?.props?.className).toContain('font-bold');
//     });

//     it('highlights correct sentence when position is between timestamps', () => {
//       mockUseProgress.mockReturnValue({
//         position: 7.5,
//         duration: 20,
//         buffered: 0,
//       });

//       render(<Script scripts={mockScripts} />);

//       const highlightedWord = getWordTextNode('2', 0);
//       expect(highlightedWord?.props?.className).toContain('text-blue-600');
//     });
//   });

//   describe('라인 클릭', () => {
//     it('seeks to correct time when first sentence is clicked', () => {
//       mockUseProgress.mockReturnValue({
//         position: 0,
//         duration: 20,
//         buffered: 0,
//       });

//       render(<Script scripts={mockScripts} />);

//       const firstWord = getWordPressable('1', 0);
//       fireEvent.press(firstWord);

//       expect(mockSeekTo).toHaveBeenCalledWith(0.0);
//     });

//     it('seeks to correct time when second sentence is clicked', () => {
//       mockUseProgress.mockReturnValue({
//         position: 0,
//         duration: 20,
//         buffered: 0,
//       });

//       render(<Script scripts={mockScripts} />);

//       const secondWord = getWordPressable('2', 0);
//       fireEvent.press(secondWord);

//       expect(mockSeekTo).toHaveBeenCalledWith(5.0);
//     });

//     it('seeks to correct time when third sentence is clicked', () => {
//       mockUseProgress.mockReturnValue({
//         position: 0,
//         duration: 20,
//         buffered: 0,
//       });

//       render(<Script scripts={mockScripts} />);

//       const thirdWord = getWordPressable('3', 0);
//       fireEvent.press(thirdWord);

//       expect(mockSeekTo).toHaveBeenCalledWith(10.0);
//     });
//   });

//   describe('엣지 케이스', () => {
//     it('handles fractional start times correctly', () => {
//       const scriptsWithFractional: Sentence[] = [
//         { id: '1', start_time: '0.5', text: 'Half second' },
//         { id: '2', start_time: '3.75', text: 'Three point seven five' },
//       ];
//       mockUseProgress.mockReturnValue({
//         position: 3.75,
//         duration: 10,
//         buffered: 0,
//       });

//       render(<Script scripts={scriptsWithFractional} />);

//       const word = getWordPressable('2', 0);
//       fireEvent.press(word);

//       expect(mockSeekTo).toHaveBeenCalledWith(3.75);
//     });

//     it('handles single script sentence', () => {
//       const singleScript: Sentence[] = [
//         { id: '1', start_time: '0.0', text: 'Only sentence' },
//       ];
//       mockUseProgress.mockReturnValue({
//         position: 0,
//         duration: 5,
//         buffered: 0,
//       });

//       render(<Script scripts={singleScript} />);

//       expect(getWordText('1', 0)).toBe('Only');
//       expect(getWordText('1', 1)).toBe('sentence');
//     });
//   });

//   describe('단어 팝업', () => {
//     it('shows popup when a word is long pressed', () => {
//       mockUseProgress.mockReturnValue({
//         position: 0,
//         duration: 20,
//         buffered: 0,
//       });

//       const utils = render(<Script scripts={mockScripts} />);
//       const [firstWordComponent] = utils.UNSAFE_getAllByType(Word);

//       act(() => {
//         firstWordComponent.props.onLongPress({
//           x: 120,
//           y: 240,
//           width: 40,
//           height: 24,
//         });
//       });

//       expect(firstWordComponent).toBeTruthy();
//       expect(screen.getByTestId('word-popup')).toBeTruthy();

//       fireEvent.press(screen.getByTestId('word-popup-backdrop'));

//       expect(screen.queryByTestId('word-popup')).toBeNull();
//     });
//   });
// });
