import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { courseFocus } from '@/features/focus/course-session';
import { loadNotifications, type NotificationsModule } from '@/features/focus/notifications-module';

type NotificationResponse = Awaited<
  ReturnType<NotificationsModule['getLastNotificationResponseAsync']>
>;

/**
 * Mount once near the root: clears blocking a killed app left on, and opens the course a reminder
 * points to when it's tapped.
 */
export function CourseFocusListener() {
  const pathname = usePathname();
  // The tap listener is registered once; it reads the latest route from here.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    courseFocus.resetStale();

    const open = (response: NotificationResponse) => {
      const course = response?.notification.request.content.data?.course;
      // Tapping while that player is still open just brings the app back; don't stack a copy.
      if (typeof course !== 'string' || pathnameRef.current === `/course/${course}/learn`) return;
      router.push({ pathname: '/course/[id]/learn', params: { id: course } });
    };

    let isMounted = true;
    let subscription: { remove: () => void } | undefined;
    loadNotifications().then((notifications) => {
      if (!notifications || !isMounted) return;
      // A tap that cold-started the app happened before this listener existed.
      const launch = notifications.getLastNotificationResponse();
      if (launch) {
        notifications.clearLastNotificationResponse();
        open(launch);
      }
      subscription = notifications.addNotificationResponseReceivedListener(open);
    });
    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  return null;
}
