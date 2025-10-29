import { customFetch } from './client';

// --- Types ---

export type AudioGenerationPayload = {
  mood: string;
  theme: string;
};

export type Sentence = {
  id: string;
  start_time: string;
  text: string;
};

export type AudioGenerationResponse = {
  title: string;
  audio_url: string;
  sentences: Sentence[];
};

// --- API functions ---

export const generateAudio = async (
  payload: AudioGenerationPayload,
): Promise<AudioGenerationResponse> => {
  return customFetch<AudioGenerationResponse>('/audio/test-generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
