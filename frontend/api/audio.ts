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
  generated_content_id: number;
  title: string;
  audio_url: string;
  sentences: Sentence[];
};

// --- API functions ---

export const generateAudio = async (
  payload: AudioGenerationPayload,
): Promise<AudioGenerationResponse> => {
  return customFetch<AudioGenerationResponse>('/audio/generate-mock', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
