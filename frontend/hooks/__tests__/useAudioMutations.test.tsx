import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as audioAPI from '@/api/audio';
import { useGenerateAudio } from '../mutations/useAudioMutations';
import type { AudioGenerationResponse } from '@/api/audio';

jest.mock('@/api/audio');

describe('useAudioMutations', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return wrapper;
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useGenerateAudio', () => {
    it('오디오 생성 성공', async () => {
      const mockResponse: AudioGenerationResponse = {
        generated_content_id: 123,
        audio_url: 'https://example.com/audio.mp3',
        script: [
          {
            index: 0,
            sentence: 'Hello world',
            translation: '안녕하세요',
            words: [
              {
                word: 'Hello',
                start_time: 0,
                end_time: 0.5,
              },
            ],
          },
        ],
      };

      (audioAPI.generateAudio as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGenerateAudio(), {
        wrapper: createWrapper(),
      });

      const payload = {
        topic: 'greetings',
        level: 'beginner',
      };

      result.current.mutate(payload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(audioAPI.generateAudio).toHaveBeenCalled();
      expect((audioAPI.generateAudio as jest.Mock).mock.calls[0][0]).toEqual(
        payload,
      );
      expect(result.current.data).toEqual(mockResponse);
    });

    it('오디오 생성 실패 시 에러 처리', async () => {
      const error = new Error('Audio generation failed');
      (audioAPI.generateAudio as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useGenerateAudio(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        topic: 'greetings',
        level: 'beginner',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });

    it('다양한 페이로드로 오디오 생성', async () => {
      const mockResponse: AudioGenerationResponse = {
        generated_content_id: 456,
        audio_url: 'https://example.com/audio2.mp3',
        script: [],
      };

      (audioAPI.generateAudio as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGenerateAudio(), {
        wrapper: createWrapper(),
      });

      const payload = {
        topic: 'business',
        level: 'advanced',
        customOption: 'some-value',
      };

      result.current.mutate(payload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(audioAPI.generateAudio).toHaveBeenCalled();
      expect((audioAPI.generateAudio as jest.Mock).mock.calls[0][0]).toEqual(
        payload,
      );
      expect(result.current.data?.generated_content_id).toBe(456);
    });

    it('로딩 상태 확인', async () => {
      let resolvePromise: (value: AudioGenerationResponse) => void;
      const promise = new Promise<AudioGenerationResponse>((resolve) => {
        resolvePromise = resolve;
      });

      (audioAPI.generateAudio as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useGenerateAudio(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        topic: 'test',
        level: 'intermediate',
      });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      const mockResponse: AudioGenerationResponse = {
        generated_content_id: 789,
        audio_url: 'https://example.com/audio3.mp3',
        script: [],
      };

      resolvePromise!(mockResponse);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.isPending).toBe(false);
    });
  });
});
