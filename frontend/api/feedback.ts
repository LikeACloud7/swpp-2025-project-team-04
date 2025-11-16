import { customFetch } from './client';

// Types

export type FeedbackPayload = {
  generated_content_id: number;
  pause_cnt: number;
  rewind_cnt: number;
  vocab_lookup_cnt: number;
  vocab_save_cnt: number;
  understanding_difficulty: number;
  speed_difficulty: number;
};

export type FeedbackResponse = {
  // 현재 레벨
  lexical_level: number;
  syntactic_level: number;
  speed_level: number;
  
  // 변화량
  lexical_level_delta: number;
  syntactic_level_delta: number;
  speed_level_delta: number;
};

// API functions

export const submitFeedback = async (
  payload: FeedbackPayload,
): Promise<FeedbackResponse> => {
  return customFetch<FeedbackResponse>('/level-system/session-feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
