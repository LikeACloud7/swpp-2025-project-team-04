import { customFetch } from './client';

export type DailyMinutes = {
  date: string;
  minutes: number;
};

export type Streak = {
  consecutive_days: number;
  weekly_total_minutes: number;
  daily_minutes: DailyMinutes[];
};

export type CurrentLevel = {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  level_score: number; // 0-100
  llm_confidence: number; // 0-100
  updated_at: string;
  level_description: string;
};

export type Achievement = {
  code: string;
  name: string;
  description: string;
  category: string;
  achieved: boolean;
  achieved_at: string | null; // datetime, null if not achieved
};

export type StatsResponse = {
  streak: Streak;
  current_level: CurrentLevel;
  total_time_spent_minutes: number;
  achievements: Achievement[];
};

export const getStats = async (): Promise<StatsResponse> => {
  return customFetch<StatsResponse>('/stats', {
    method: 'GET',
  });
};
