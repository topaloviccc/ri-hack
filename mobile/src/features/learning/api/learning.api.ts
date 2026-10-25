import type { LearningResponse, QuizAnswer, QuizResponse, QuizResult } from './learning.dto';
import { apiRequest } from '@/lib/api-client';

const base = (id: string) => `/courses/${encodeURIComponent(id)}/learning`;
export const learningApi = {
  get: (course: string): Promise<LearningResponse> => apiRequest(base(course), { viewer: true }),
  start: (course: string): Promise<LearningResponse> =>
    apiRequest(`${base(course)}/start`, { method: 'POST', viewer: true }),
  completeLesson: (course: string, lesson: string): Promise<LearningResponse> =>
    apiRequest(`${base(course)}/lessons/${encodeURIComponent(lesson)}/complete`, {
      method: 'POST',
      viewer: true,
    }),
  quiz: (course: string, quiz: string): Promise<QuizResponse> =>
    apiRequest(`${base(course)}/quizzes/${encodeURIComponent(quiz)}`, { viewer: true }),
  submit: (course: string, quiz: string, answers: QuizAnswer[], key: string): Promise<QuizResult> =>
    apiRequest(`${base(course)}/quizzes/${encodeURIComponent(quiz)}/attempts`, {
      method: 'POST',
      viewer: true,
      body: { answers },
      headers: { 'Idempotency-Key': key },
    }),
};
