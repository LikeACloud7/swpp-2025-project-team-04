import {
  generateAudio,
  type AudioGenerationPayload,
  type AudioGenerationResponse,
} from '@/api/audio';
import { useMutation } from '@tanstack/react-query';

export const useGenerateAudio = () => {
  return useMutation<AudioGenerationResponse, unknown, AudioGenerationPayload>({
    mutationFn: generateAudio,
    onError: (error) => console.error('오디오 생성 실패:', error),
  });
};
