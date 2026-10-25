import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { AppState, Platform } from 'react-native';

import { courseFocus } from '@/features/focus/course-session';

/**
 * Call from the course player. While its screen is focused and the course is in progress, the
 * chosen apps are blocked; leaving the screen or finishing the course unblocks them. Leaving the
 * app keeps them blocked and schedules a reminder.
 */
export function useCourseFocus(course: string, isInProgress: boolean) {
  // useFocusEffect re-runs whenever its callback's identity changes, so it must be stable.
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android' || !isInProgress) return;
      courseFocus.enter(course);
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'background') courseFocus.appBackgrounded(course);
        else if (state === 'active') courseFocus.appForegrounded();
      });
      return () => {
        subscription.remove();
        courseFocus.leave(course);
      };
    }, [course, isInProgress]),
  );
}
