import type { LearningResponse } from '../api/learning.dto';
import { learningProgress, lessonState, quizState } from '../progress';

function course(): LearningResponse {
  return {
    estimatedMinutes: 30,
    courseId: 'course',
    versionId: 'version',
    enrollmentId: 'enrollment',
    title: 'Course',
    started: true,
    completed: false,
    completedAt: null,
    percentage: 0,
    correctCount: 0,
    questionCount: 9,
    rewardCoins: 10,
    awardedCoins: 0,
    lessons: [0, 1].map((index) => ({
      id: `lesson-${index}`,
      estimatedMinutes: null,
      position: index,
      title: `Lesson ${index + 1}`,
      text: null,
      demo: true,
      unlocked: index === 0,
      completed: false,
      quiz: {
        id: `quiz-${index}`,
        title: `Quiz ${index + 1}`,
        questionCount: 2,
        attempts: 0,
        bestCorrectCount: null,
        unlocked: false,
      },
    })),
    finalQuiz: {
      id: 'final',
      title: 'Final quiz',
      questionCount: 5,
      attempts: 0,
      bestCorrectCount: null,
      unlocked: false,
    },
  };
}
describe('course path progress', () => {
  it('counts lessons and quizzes as distinct steps and resumes at the unread lesson', () => {
    const learning = course();
    expect(learningProgress(learning)).toMatchObject({
      done: 0,
      total: 5,
      fraction: 0,
      hasScore: false,
      next: { lesson: 'lesson-0' },
    });
    learning.lessons[0].completed = true;
    learning.lessons[0].quiz.unlocked = true;
    expect(learningProgress(learning)).toMatchObject({ done: 1, next: { quiz: 'quiz-0' } });
  });
  it('counts a submitted zero-score quiz once and resumes at the next available lesson', () => {
    const learning = course();
    learning.lessons[0].completed = true;
    Object.assign(learning.lessons[0].quiz, { unlocked: true, attempts: 7, bestCorrectCount: 0 });
    learning.lessons[1].unlocked = true;
    expect(learningProgress(learning)).toMatchObject({
      done: 2,
      fraction: 0.4,
      next: { lesson: 'lesson-1' },
    });
  });
  it('includes the final quiz in progress and offers it before any retry', () => {
    const learning = course();
    learning.lessons.forEach((lesson) => {
      lesson.unlocked = true;
      lesson.completed = true;
      Object.assign(lesson.quiz, { unlocked: true, attempts: 1, bestCorrectCount: 0 });
    });
    learning.finalQuiz.unlocked = true;
    expect(learningProgress(learning)).toMatchObject({
      done: 4,
      total: 5,
      fraction: 0.8,
      next: { quiz: 'final' },
    });
    Object.assign(learning.finalQuiz, { attempts: 1, bestCorrectCount: 1 });
    expect(learningProgress(learning)).toMatchObject({
      done: 5,
      fraction: 1,
      next: { quiz: 'final' },
    });
    expect(learning.completed).toBe(false);
  });
  it('shows saved historical completions as fully done without inventing quiz attempts', () => {
    const learning = { ...course(), completed: true };
    expect(learningProgress(learning)).toMatchObject({
      done: 5,
      fraction: 1,
      hasScore: false,
      next: undefined,
    });
    expect(lessonState(learning.lessons[1], true)).toBe('completed');
    expect(quizState(learning.finalQuiz, true)).toBe('completed');
    expect(learning.finalQuiz.attempts).toBe(0);
  });
  it('does not unlock future lessons or quizzes based on progress or score alone', () => {
    const learning = course();
    expect(lessonState(learning.lessons[1], false)).toBe('locked');
    expect(quizState(learning.lessons[0].quiz, false)).toBe('locked');
    learning.started = false;
    learning.lessons[0].unlocked = false;
    expect(learningProgress(learning).next).toBeUndefined();
  });
});
