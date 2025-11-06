import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/api/client';
import { addVocab } from '@/api/vocab';
import {
  MY_VOCAB_QUERY_KEY,
  STATS_QUERY_KEY,
  VOCAB_QUERY_KEY,
} from '@/constants/queryKeys';

// ✅ addVocab 함수에 맞게 word 필드 추가
type AddVocabVariables = {
  generatedContentId: number;
  index: number;
  word: string;
};

export const useAddVocab = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, AddVocabVariables>({
    // ✅ word까지 전달
    mutationFn: ({ generatedContentId, index, word }) =>
      addVocab(generatedContentId, index, word),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VOCAB_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_VOCAB_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEY] });
    },

    onError: (error) => {
      console.error('단어 저장 실패:', error);
    },
  });
};
