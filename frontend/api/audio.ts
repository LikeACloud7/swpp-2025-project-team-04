import { customFetch } from './client';

// --- Types ---

export type AudioGenerationPayload = {
  mood: string;
  theme: string;
};

export type Sentence = {
  id: number;
  start_time: number;
  text: string;
};

export type AudioGenerationResponse = {
  generated_content_id: number;
  title: string;
  audio_url: string;
  sentences: Sentence[];
};

// --- API functions ---

export const generateAudio = async (
  payload: AudioGenerationPayload,
): Promise<AudioGenerationResponse> => {
  return customFetch<AudioGenerationResponse>('/audio/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export type AudioHistoryItem = {
  generated_content_id: number;
  user_id: number;
  title: string;
  audio_url: string;
  script_data: string;
  sentences: Sentence[];
  created_at: string;
  updated_at: string;
};

export type AudioHistoryResponse = {
  items: AudioHistoryItem[];
  total: number;
  limit: number;
  offset: number;
};

export type AudioHistoryParams = {
  limit?: number;
  offset?: number;
};

export const getAudioHistory = async (
  params: AudioHistoryParams = {},
): Promise<AudioHistoryResponse> => {
  const { limit = 20, offset = 0 } = params;
  return customFetch<AudioHistoryResponse>(
    `/audio/history?limit=${limit}&offset=${offset}`,
    {
      method: 'GET',
    },
  );
};
