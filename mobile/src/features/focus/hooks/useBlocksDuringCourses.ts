import { Platform } from 'react-native';

import { useBlockedAppsQuery, useFocusEnabledQuery } from '@/features/focus/api/focus.queries';

/** Whether courses pause the user's chosen apps, e.g. to say they're unblocked after passing. */
export function useBlocksDuringCourses() {
  const isEnabled = useFocusEnabledQuery();
  const blocked = useBlockedAppsQuery();
  return Platform.OS === 'android' && !!isEnabled.data && (blocked.data?.length ?? 0) > 0;
}
