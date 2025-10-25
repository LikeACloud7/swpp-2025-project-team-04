import { customFetch } from './client';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type LevelTestItem = {
  script_id: string;
  understanding: number; // 0-100
};

export type LevelTestPayload = {
  tests: LevelTestItem[];
};

export type LevelTestResponse = {
  level: CEFRLevel;
  level_description: string;
  scores: {
    level_score: number; // 0-100
    llm_confidence: number; // 0-100
  };
  rationale: string;
  updated_at: string;
};

export type ManualLevelPayload = {
  level: CEFRLevel;
};

export type ManualLevelResponse = {
  level: CEFRLevel;
  level_description: string;
  updated_at: string;
};



export const mapLevelIdToCEFR = (levelId: string): CEFRLevel => {
  const levelMap: Record<string, CEFRLevel> = {
    '1': 'A1',
    '2': 'A2',
    '3': 'B1',
    '4': 'B2',
    '5': 'C1',
    '6': 'C2',
  };

  return levelMap[levelId];
};


export const generateScriptId = (level: CEFRLevel, questionNumber: number): string => {
  return `${level}_${questionNumber}`;
};


export const getAudioUrl = (levelId: string, questionNumber: number): string => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  const cefrLevel = mapLevelIdToCEFR(levelId);
  return `${baseUrl}/api/v1/initial-survey/${cefrLevel}/${questionNumber}`;
};





export const submitLevelTest = async (
  levelId: string,
  percentages: number[]
): Promise<LevelTestResponse> => {
  const cefrLevel = mapLevelIdToCEFR(levelId);


  const tests: LevelTestItem[] = percentages.map((understanding, index) => ({
    script_id: generateScriptId(cefrLevel, index + 1),
    understanding,
  }));

  const payload: LevelTestPayload = { tests };

  return customFetch<LevelTestResponse>('/personalization/level-test', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};


export const submitManualLevel = async (
  levelId: string
): Promise<ManualLevelResponse> => {
  const cefrLevel = mapLevelIdToCEFR(levelId);

  const payload: ManualLevelPayload = { level: cefrLevel };

  return customFetch<ManualLevelResponse>('/personalization/manual-level', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
