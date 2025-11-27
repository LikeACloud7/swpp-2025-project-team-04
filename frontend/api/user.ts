import { User } from '@/types/type';
import { customFetch } from './client';

export const getMe = async (): Promise<User> => {
  return customFetch<User>('/users/me', {
    method: 'GET',
  });
};

export type UpdateInterestsPayload = {
  interests: string[];
};

export type UpdateInterestsResponse = {
  interests: string[];
};

export const updateInterests = async (
  interests: string[],
): Promise<UpdateInterestsResponse> => {
  const payload: UpdateInterestsPayload = { interests };

  return customFetch<UpdateInterestsResponse>('/user/me/interests', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};
