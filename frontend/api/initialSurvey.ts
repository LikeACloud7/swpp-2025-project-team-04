// 레벨 ID를 CEFR 코드로 변환 ('1' -> 'A1', '2' -> 'A2', ...)
export const mapLevelIdToCEFR = (levelId: string): string => {
  const levelMap: Record<string, string> = {
    '1': 'A1',
    '2': 'A2',
    '3': 'B1',
    '4': 'B2',
    '5': 'C1',
    '6': 'C2',
  };

  return levelMap[levelId];
};

// 초기 설문 오디오 파일 URL 생성
export const getAudioUrl = (levelId: string, questionNumber: number): string => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  const cefrLevel = mapLevelIdToCEFR(levelId);
  return `${baseUrl}/api/v1/initial-survey/${cefrLevel}/${questionNumber}`;
};

// TODO: Replace with actual API call when backend is ready
// 초기 설문 결과 제출 (Mock)
export const submitInitialSurvey = (
  levelId: string,
  percentages: number[],
  topics: string[]
): void => {
  const cefrLevel = mapLevelIdToCEFR(levelId);
  console.log('Survey submitted:', [cefrLevel, percentages, topics]);
};
