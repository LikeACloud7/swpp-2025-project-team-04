import { customFetch } from './client';

/** ========= Types: 학습 오디오별 Vocab ========= */

export type WordDetail = {
  pos: string;
  word: string;
  meaning: string;
};

export type VocabSentence = {
  text: string;
  index: number;
  words: WordDetail[];
};

export type VocabResponse = {
  sentences: VocabSentence[];
};

/** ========= Types: 내 단어장(My Vocab) =========
 * 서버 응답이 배열 형태(예시)
 * [
 *   { id, word, example_sentence, example_sentence_url, pos, meaning },
 *   ...
 * ]
 */
export type MyVocab = {
  id: number;
  word: string;
  example_sentence: string;
  example_sentence_url: string;
  pos: string;
  meaning: string;
};

/** ========= API: 학습 오디오별 Vocab ========= */

export const getVocab = async (
  generatedContentId: number,
): Promise<VocabResponse> => {
  return customFetch<VocabResponse>(`/vocabs/${generatedContentId}`, {
    method: 'GET',
  });
};

/** 단어 추가(해당 문장 index에 대해 word를 추가) */
export const addVocab = async (
  generatedContentId: number,
  index: number,
  word: string,
): Promise<void> => {
  return customFetch<void>(`/vocabs/${generatedContentId}/sentences/${index}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word }),
  });
};

/** ========= API: 내 단어장(My Vocab) ========= */

export const getMyVocab = async (): Promise<MyVocab[]> => {
  return customFetch<MyVocab[]>(`/vocabs/me`, {
    method: 'GET',
  });
};

export const deleteMyVocab = async (wordId: number): Promise<void> => {
  return customFetch<void>(`/vocabs/me/${wordId}`, {
    method: 'DELETE',
  });
};
