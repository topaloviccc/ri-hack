export type LearningQuizSummary = {
  id: string;
  title: string;
  questionCount: number;
  attempts: number;
  bestCorrectCount: number | null;
  unlocked: boolean;
};
export type LearningLesson = {
  estimatedMinutes: number | null;
  id: string;
  title: string;
  position: number;
  text: string | null;
  demo: boolean;
  unlocked: boolean;
  completed: boolean;
  quiz: LearningQuizSummary;
};
export type LearningResponse = {
  estimatedMinutes: number | null;
  courseId: string;
  versionId: string;
  enrollmentId: string | null;
  title: string;
  started: boolean;
  completed: boolean;
  completedAt: string | null;
  percentage: number;
  correctCount: number;
  questionCount: number;
  rewardCoins: number;
  awardedCoins: number;
  lessons: LearningLesson[];
  finalQuiz: LearningQuizSummary;
};
export type QuizResponse = {
  id: string;
  title: string;
  finalQuiz: boolean;
  questions: {
    id: string;
    type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
    prompt: string;
    options: { id: string; text: string }[];
  }[];
};
export type QuizAnswer = { questionId: string; optionIds: string[] };
export type QuizResult = {
  attemptId: string;
  quizId: string;
  attemptNumber: number;
  correctCount: number;
  questionCount: number;
  percentage: number;
  feedback: {
    questionId: string;
    correct: boolean;
    selectedOptionIds: string[];
    correctOptionIds: string[];
    explanation: string | null;
  }[];
  learning: LearningResponse;
};
