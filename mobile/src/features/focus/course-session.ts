import { focusApi } from '@/features/focus/api/focus.api';
import { loadNotifications } from '@/features/focus/notifications-module';

const REMINDER_DELAY_SECONDS = 30;
const REMINDER_CHANNEL_ID = 'course-reminders';

/** The course whose player is on screen; null when none is. */
let currentCourse: string | null = null;
let reminderId: string | null = null;
// Native calls are async; running them one at a time keeps a quick leave-then-enter in order.
let queue: Promise<void> = Promise.resolve();
const enqueue = (task: () => Promise<void>) => {
  // A failed native call (e.g. a permission revoked meanwhile) must not jam the ones after it.
  queue = queue.then(task).catch(() => {});
  return queue;
};

const canBlock = async () => {
  if (!(await focusApi.getIsEnabled())) return false;
  const permissions = await focusApi.getPermissions();
  if (!permissions?.overlay || !permissions.usageAccess) return false;
  return (await focusApi.getBlockedApps()).length > 0;
};

const stopBlocking = async () => {
  if (await focusApi.getIsActive()) await focusApi.setActive(false);
};

const cancelReminder = async () => {
  if (!reminderId) return;
  const id = reminderId;
  reminderId = null;
  await (await loadNotifications())?.cancelScheduledNotificationAsync(id);
};

const scheduleReminder = async (course: string) => {
  await cancelReminder();
  const notifications = await loadNotifications();
  if (!notifications || currentCourse !== course || !(await focusApi.getIsEnabled())) return;
  await notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Course reminders',
    importance: notifications.AndroidImportance.HIGH,
  });
  reminderId = await notifications.scheduleNotificationAsync({
    content: {
      title: 'Your course is waiting',
      body: 'Come back and finish it.',
      data: { course },
    },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: REMINDER_DELAY_SECONDS,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
};

/**
 * Blocks the chosen apps while an unfinished course's player is on screen, and reminds the user
 * to come back when they leave the app mid-course. Device-local, Android only (callers check).
 */
export const courseFocus = {
  enter: (course: string) => {
    currentCourse = course;
    return enqueue(async () => {
      if (currentCourse !== course) return;
      if (await canBlock()) await focusApi.setActive(true);
      else await stopBlocking();
    });
  },
  leave: (course: string) => {
    if (currentCourse !== course) return queue;
    currentCourse = null;
    return enqueue(async () => {
      await cancelReminder();
      // Another course may have been entered while this task waited its turn.
      if (currentCourse === null) await stopBlocking();
    });
  },
  appBackgrounded: (course: string) => enqueue(() => scheduleReminder(course)),
  appForegrounded: () => enqueue(cancelReminder),
  /** At launch no player has been left, so blocking still on was left by a killed app. */
  resetStale: () =>
    enqueue(async () => {
      if (currentCourse === null) await stopBlocking();
    }),
};
