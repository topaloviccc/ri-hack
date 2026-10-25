import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { CoursePlayer } from '../components/CoursePlayer';
import type { LearningResponse, QuizResponse, QuizResult } from '../api/learning.dto';
import { learningKeys } from '../api/learning.queries';
import { httpResponse } from '@/test-support/api-fixture';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({ router: { setParams: jest.fn() } }));
// Keep the real query contracts without loading unrelated map/reel/native screens.
jest.mock('@/features/courses', () => ({
  courseKeys: jest.requireActual('@/features/courses/api/courses.queries').courseKeys,
  useCourseQuery: () => ({ data: undefined }),
}));
jest.mock('@/features/network', () => ({
  networkKeys: jest.requireActual('@/features/network/api/network.queries').networkKeys,
}));
jest.mock('@/features/users', () => ({
  userKeys: jest.requireActual('@/features/users/api/users.queries').userKeys,
}));
// App blocking is native and Android only; its own tests cover it.
jest.mock('@/features/focus', () => ({
  useCourseFocus: () => {},
  useBlocksDuringCourses: () => false,
}));
jest.mock('@/features/wallet', () => ({
  walletKeys: jest.requireActual('@/features/wallet/api/wallet.queries').walletKeys,
}));

const initial: LearningResponse = {
  estimatedMinutes: 30,
  courseId: 'course',
  versionId: 'version',
  enrollmentId: null,
  title: 'Test course',
  started: false,
  completed: false,
  completedAt: null,
  percentage: 0,
  correctCount: 0,
  questionCount: 5,
  rewardCoins: 10,
  awardedCoins: 0,
  lessons: [
    {
      id: 'lesson',
      estimatedMinutes: 6,
      title: 'First lesson',
      position: 0,
      text: null,
      demo: true,
      unlocked: false,
      completed: false,
      quiz: {
        id: 'quiz',
        title: 'Lesson quiz',
        questionCount: 1,
        attempts: 0,
        bestCorrectCount: null,
        unlocked: false,
      },
    },
  ],
  finalQuiz: {
    id: 'final',
    title: 'Final summary quiz',
    questionCount: 4,
    attempts: 0,
    bestCorrectCount: null,
    unlocked: false,
  },
};
const quiz: QuizResponse = {
  id: 'quiz',
  title: 'Lesson quiz',
  finalQuiz: false,
  questions: [
    {
      id: 'question',
      type: 'MULTIPLE_CHOICE',
      prompt: 'Select both correct statements.',
      options: [
        { id: 'a', text: 'First correct statement' },
        { id: 'b', text: 'Second correct statement' },
        { id: 'c', text: 'Incorrect statement' },
      ],
    },
  ],
};
function started(): LearningResponse {
  return {
    ...initial,
    started: true,
    enrollmentId: 'enrollment',
    lessons: [
      {
        ...initial.lessons[0],
        unlocked: true,
        text: 'Stored lesson text',
        completed: true,
        quiz: { ...initial.lessons[0].quiz, unlocked: true },
      },
    ],
  };
}
function result(completed: boolean): QuizResult {
  return {
    attemptId: 'attempt',
    quizId: 'quiz',
    attemptNumber: 1,
    correctCount: 1,
    questionCount: 1,
    percentage: 100,
    feedback: [
      {
        questionId: 'question',
        correct: true,
        selectedOptionIds: ['a', 'b'],
        correctOptionIds: ['a', 'b'],
        explanation: 'Stored explanation',
      },
    ],
    learning: {
      ...started(),
      percentage: completed ? 80 : 20,
      correctCount: completed ? 4 : 1,
      completed,
      awardedCoins: completed ? 10 : 0,
    },
  };
}
describe('database-backed course player', () => {
  let client: QueryClient;
  let fetchMock: jest.MockedFunction<typeof fetch>;
  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock;
  });
  afterEach(() => client.clear());
  const mount = (props: { lesson?: string; quiz?: string } = {}) =>
    render(
      <QueryClientProvider client={client}>
        <CoursePlayer id="course" {...props} />
      </QueryClientProvider>,
    );

  it('starts through HTTP and unlocks the first lesson using the returned state', async () => {
    fetchMock.mockImplementation(async (_url, init) =>
      httpResponse(init?.method === 'POST' ? started() : initial),
    );
    await mount();
    expect(await screen.findByText('Test course')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Read lesson 1' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Start learning' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Read lesson 1' })).not.toBeDisabled(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/courses\/course\/learning\/start$/),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('submits all selected options, displays server feedback and preserves an overall failing result', async () => {
    client.setQueryData(learningKeys.course('course'), started());
    fetchMock.mockImplementation(async (url, init) =>
      httpResponse(
        init?.method === 'POST'
          ? result(false)
          : String(url).includes('/quizzes/')
            ? quiz
            : started(),
      ),
    );
    await mount({ quiz: 'quiz' });
    expect(await screen.findByText(/Select both correct statements\./)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Submit quiz' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'First correct statement' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Second correct statement' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Submit quiz' }));
    expect(await screen.findByText('Quiz results')).toBeOnTheScreen();
    expect(screen.getByText('Stored explanation')).toBeOnTheScreen();
    expect(screen.queryByText(/Course passed!/)).toBeNull();
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(post?.[1]).toMatchObject({
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'Idempotency-Key': expect.any(String),
      }),
    });
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({
      answers: [{ questionId: 'question', optionIds: ['a', 'b'] }],
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Retry quiz' }));
    expect(screen.getByRole('button', { name: 'Submit quiz' })).toBeDisabled();
  });

  it('shows passing status and the once-only coin reward from the server', async () => {
    client.setQueryData(learningKeys.course('course'), started());
    fetchMock.mockImplementation(async (url, init) =>
      httpResponse(
        init?.method === 'POST'
          ? result(true)
          : String(url).includes('/quizzes/')
            ? quiz
            : started(),
      ),
    );
    await mount({ quiz: 'quiz' });
    await fireEvent.press(await screen.findByRole('checkbox', { name: 'First correct statement' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Second correct statement' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Submit quiz' }));
    expect(await screen.findByText('Course passed! 10 coins awarded.')).toBeOnTheScreen();
    expect(client.getQueryData(learningKeys.course('course'))).toMatchObject({
      completed: true,
      awardedCoins: 10,
    });
  });

  it('keeps locked actions disabled and labels content progress independently of the score', async () => {
    fetchMock.mockResolvedValue(httpResponse(initial));
    await mount();
    expect(await screen.findByLabelText('Course content progress')).toHaveProp(
      'accessibilityValue',
      { min: 0, max: 100, now: 0 },
    );
    expect(screen.getByText('Not graded yet')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Read lesson 1' }));
    expect(router.setParams).not.toHaveBeenCalled();
  });

  it('shows historical completed courses at 100% without a misleading zero score', async () => {
    fetchMock.mockResolvedValue(httpResponse({ ...initial, started: true, completed: true }));
    await mount();
    expect(await screen.findByLabelText('Course content progress')).toHaveProp(
      'accessibilityValue',
      { min: 0, max: 100, now: 100 },
    );
    expect(screen.getByText('Course passed')).toBeOnTheScreen();
    expect(screen.getByText('Saved completion')).toBeOnTheScreen();
    expect(screen.queryByText('0%')).toBeNull();
  });

  it('offers a retry when all steps are finished but the course score is below 80%', async () => {
    const learning = started();
    learning.lessons[0].quiz.attempts = 1;
    learning.lessons[0].quiz.bestCorrectCount = 1;
    Object.assign(learning.finalQuiz, { unlocked: true, attempts: 1, bestCorrectCount: 0 });
    learning.percentage = 20;
    learning.correctCount = 1;
    fetchMock.mockResolvedValue(httpResponse(learning));
    await mount();
    expect(await screen.findByLabelText('Course content progress')).toHaveProp(
      'accessibilityValue',
      { min: 0, max: 100, now: 100 },
    );
    expect(screen.getByText('20%')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Improve quiz score' }));
    expect(router.setParams).toHaveBeenCalledWith({ lesson: undefined, quiz: 'final' });
    expect(screen.queryByText('Course passed')).toBeNull();
  });

  it('renders a longer lesson as readable sections with its time estimate and quiz action', async () => {
    const learning = started();
    learning.lessons[0].text =
      '## A landscape\n\nA readable paragraph.\n\n## Try a comparison\n\nReflect on two habitats.';
    fetchMock.mockResolvedValue(httpResponse(learning));
    await mount({ lesson: 'lesson' });
    expect(await screen.findByRole('header', { name: 'A landscape' })).toBeOnTheScreen();
    expect(screen.getByText('A readable paragraph.')).toBeOnTheScreen();
    expect(screen.getByText('Pause & think')).toBeOnTheScreen();
    expect(screen.getByText(/About 6 min/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Continue to quiz' }));
    await waitFor(() =>
      expect(router.setParams).toHaveBeenCalledWith({ lesson: undefined, quiz: 'quiz' }),
    );
  });

  it('displays a retryable backend error rather than substituting demo learning records', async () => {
    fetchMock.mockResolvedValue(
      httpResponse({ detail: 'Course lessons and quizzes are not available yet' }, 409),
    );
    await mount();
    expect(
      await screen.findByText('Course lessons and quizzes are not available yet'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen();
  });
});
