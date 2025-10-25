import { useRouter } from '@/.expo/types/router';
import {
  generateAudio,
  type AudioGenerationPayload,
  type AudioGenerationResponse,
} from '@/api/audio';
import { useMutation } from '@tanstack/react-query';

export const useGenerateAudio = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: generateAudio,
    onSuccess: (data: AudioGenerationResponse) => {
      console.log('오디오 생성 API 호출 성공:', data);
    },
    onError: (error) => console.error('오디오 생성 실패:', error),
  });
};
