import {
  generateAudio,
  type AudioGenerationPayload,
  type AudioGenerationResponse,
} from '@/api/audio';
import { useMutation } from '@tanstack/react-query';

export const useGenerateAudio = () => {
  return useMutation({
    mutationFn: generateAudio,
    onSuccess: (data: AudioGenerationResponse) => {
      console.log('오디오 생성 API 호출 성공:', data);
    },
    onError: (error) => console.error('오디오 생성 실패:', error),
  });
};
