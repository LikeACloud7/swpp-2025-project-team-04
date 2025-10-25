import { customFetch } from './client';

// --- Types ---

export type AudioGenerationPayload = {
  mood: 'string';
  theme: 'string';
};

export type AudioGenerationResponse = {
  title: 'string';
  audio_url: 'string';
  sentences: [
    {
      id: 'string';
      start_time: 'string';
      text: 'string';
    },
  ];
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
