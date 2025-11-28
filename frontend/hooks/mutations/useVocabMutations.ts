import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/api/client';
import { addVocab } from '@/api/vocab';
import {
  MY_VOCAB_QUERY_KEY,
  STATS_QUERY_KEY,
  VOCAB_QUERY_KEY,
} from '@/constants/queryKeys';

// 단어장에 추가 대기중인 단어 정보
export type PendingVocab = {
  sentenceIndex: number;
  word: string;
};

type AddVocabPayload = {
  generatedContentId: number;
  pendingVocab: PendingVocab;
};

export const useAddVocab = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, AddVocabPayload>({
    // ✅ word까지 전달
    mutationFn: ({ generatedContentId, pendingVocab }) =>
      addVocab(
        generatedContentId,
        pendingVocab.sentenceIndex,
        pendingVocab.word,
      ),

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
