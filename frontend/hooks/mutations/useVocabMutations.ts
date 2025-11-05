import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/api/client';
import { addVocab } from '@/api/vocab';
import { STATS_QUERY_KEY } from '@/constants/queryKeys';

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
      // ✅ 저장 성공 시 통계 데이터 갱신
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
    },

    onError: (error) => {
      console.error('단어 저장 실패:', error);
    },
  });
};
