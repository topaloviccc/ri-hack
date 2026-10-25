import { renderHook } from '@testing-library/react-native';
import { AppState, Platform } from 'react-native';

import { courseFocus } from '@/features/focus/course-session';
import { useCourseFocus } from '@/features/focus/hooks/useCourseFocus';

jest.mock('@/features/focus/course-session', () => ({
  courseFocus: {
    enter: jest.fn(),
    leave: jest.fn(),
    appBackgrounded: jest.fn(),
    appForegrounded: jest.fn(),
  },
}));
// Screen focus behaves like mounting here: the effect runs on render and cleans up on unmount.
jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual<typeof import('react')>('react').useEffect(effect, [effect]),
}));

type Change = (state: string) => void;
let emitChange: Change = () => {};

beforeEach(() => {
  jest.clearAllMocks();
  jest.replaceProperty(Platform, 'OS', 'android');
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    emitChange = listener as Change;
    return { remove: jest.fn() } as unknown as ReturnType<typeof AppState.addEventListener>;
  });
});

const render = (isInProgress: boolean) =>
  renderHook(({ inProgress }: { inProgress: boolean }) => useCourseFocus('course', inProgress), {
    initialProps: { inProgress: isInProgress },
  });

it('enters when the player opens on a course in progress and leaves when it closes', async () => {
  const { unmount } = await render(true);
  expect(courseFocus.enter).toHaveBeenCalledWith('course');
  await unmount();
  expect(courseFocus.leave).toHaveBeenCalledWith('course');
});

it('leaves as soon as the course is finished', async () => {
  const { rerender } = await render(true);
  await rerender({ inProgress: false });
  expect(courseFocus.leave).toHaveBeenCalledWith('course');
  expect(courseFocus.enter).toHaveBeenCalledTimes(1);
});

it('does nothing for a course that is not in progress', async () => {
  await render(false);
  expect(courseFocus.enter).not.toHaveBeenCalled();
});

it('reminds when the app goes to the background and cancels when it returns', async () => {
  await render(true);
  emitChange('background');
  expect(courseFocus.appBackgrounded).toHaveBeenCalledWith('course');
  emitChange('active');
  expect(courseFocus.appForegrounded).toHaveBeenCalled();
});

it('does nothing on iOS', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  await render(true);
  expect(courseFocus.enter).not.toHaveBeenCalled();
});
