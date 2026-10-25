import type { LearningLesson, LearningQuizSummary, LearningResponse } from './api/learning.dto';

export type LearningTarget = { lesson?: string; quiz?: string };
export type LearningStepState = 'locked' | 'ready' | 'completed';

export function lessonState(lesson: LearningLesson, courseCompleted: boolean): LearningStepState {
  if (courseCompleted) return 'completed';
  if (!lesson.unlocked) return 'locked';
  return lesson.completed ? 'completed' : 'ready';
}

export function quizState(quiz: LearningQuizSummary, courseCompleted: boolean): LearningStepState {
  if (courseCompleted) return 'completed';
  if (!quiz.unlocked) return 'locked';
  return quiz.attempts > 0 ? 'completed' : 'ready';
}

/** Content progress is independent of the quiz score; a submitted quiz completes a step. */
export function learningProgress(learning: LearningResponse) {
  const total = learning.lessons.length * 2 + 1;
  const done = learning.completed
    ? total
    : learning.lessons.reduce(
        (count, lesson) => count + Number(lesson.completed) + Number(lesson.quiz.attempts > 0),
        0,
      ) + Number(learning.finalQuiz.attempts > 0);
  const quizzes = [...learning.lessons.map((lesson) => lesson.quiz), learning.finalQuiz];
  let next: LearningTarget | undefined;
  if (learning.started && !learning.completed) {
    for (const lesson of learning.lessons) {
      if (lesson.unlocked && !lesson.completed) {
        next = { lesson: lesson.id };
        break;
      }
      if (lesson.quiz.unlocked && lesson.quiz.attempts === 0) {
        next = { quiz: lesson.quiz.id };
        break;
      }
    }
    if (!next && learning.finalQuiz.unlocked && learning.finalQuiz.attempts === 0)
      next = { quiz: learning.finalQuiz.id };
    if (!next) {
      const weakest = quizzes
        .filter((quiz) => quiz.unlocked && quiz.attempts > 0)
        .sort(
          (a, b) =>
            b.questionCount -
            (b.bestCorrectCount ?? 0) -
            (a.questionCount - (a.bestCorrectCount ?? 0)),
        )[0];
      if (weakest) next = { quiz: weakest.id };
    }
  }
  return {
    total,
    done,
    fraction: done / total,
    hasScore: quizzes.some((quiz) => quiz.attempts > 0),
    next,
  };
}
