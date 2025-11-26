import {
  submitLevelTest,
  submitManualLevel,
  type LevelTestResponse,
  type ManualLevelResponse,
} from '@/api/initialSurvey';
import { updateInterests, type UpdateInterestsResponse } from '@/api/user';
import { useMutation } from '@tanstack/react-query';

type SubmitLevelTestParams = {
  levelId: string;
  percentages: number[];
};

type SubmitManualLevelParams = {
  levelId: string;
};

export const useSubmitLevelTest = () => {
  return useMutation({
    mutationFn: ({ levelId, percentages }: SubmitLevelTestParams) =>
      submitLevelTest(levelId, percentages),
    onSuccess: (data: LevelTestResponse) => {
      console.log('레벨 테스트 제출 성공:', data);
    },
    onError: (error) => console.error('레벨 테스트 제출 실패:', error),
  });
};

export const useSubmitManualLevel = () => {
  return useMutation({
    mutationFn: ({ levelId }: SubmitManualLevelParams) =>
      submitManualLevel(levelId),
    onSuccess: (data: ManualLevelResponse) => {
      console.log('수동 레벨 설정 성공:', data);
    },
    onError: (error) => console.error('수동 레벨 설정 실패:', error),
  });
};

type UpdateInterestsParams = {
  interests: string[];
};

export const useUpdateInterests = () => {
  return useMutation({
    mutationFn: ({ interests }: UpdateInterestsParams) =>
      updateInterests(interests),
    onSuccess: (data: UpdateInterestsResponse) => {
      console.log('관심사 업데이트 성공:', data);
    },
    onError: (error) => console.error('관심사 업데이트 실패:', error),
  });
};
