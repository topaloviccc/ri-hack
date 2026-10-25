import { STORAGE_KEYS } from '@/lib/storage';

const mockBlocker = {
  getPermissionStatus: jest.fn(),
  configureAndroid: jest.fn(),
  setBlockedApps: jest.fn(),
  startMonitoring: jest.fn(),
  stopMonitoring: jest.fn(),
};
const mockNotifications = {
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
};
jest.mock('@/features/focus/app-blocker-module', () => ({
  loadAppBlocker: async () => mockBlocker,
}));
jest.mock('@/features/focus/notifications-module', () => ({
  loadNotifications: async () => mockNotifications,
}));

type Session = typeof import('@/features/focus/course-session').courseFocus;
type Api = typeof import('@/features/focus/api/focus.api').focusApi;
type Storage = typeof import('@/lib/storage').storage;
let courseFocus: Session;
let focusApi: Api;
let storage: Storage;

const grant = (granted: boolean) =>
  mockBlocker.getPermissionStatus.mockResolvedValue({
    details: { platform: 'android', overlay: granted, usageStats: granted, notifications: true },
  });
const isBlocking = async () => (await storage.get(STORAGE_KEYS.focusIsActive)) === 'true';

beforeEach(async () => {
  jest.clearAllMocks();
  // The session remembers the open course in module state; give each test a fresh one. Storage
  // comes from the same registry so the test and the app read one in-memory store.
  jest.isolateModules(() => {
    courseFocus = jest.requireActual('@/features/focus/course-session').courseFocus;
    focusApi = jest.requireActual('@/features/focus/api/focus.api').focusApi;
    storage = jest.requireActual('@/lib/storage').storage;
  });
  await Promise.all(Object.values(STORAGE_KEYS).map((key) => storage.remove(key)));
  grant(true);
  mockNotifications.scheduleNotificationAsync.mockResolvedValue('reminder');
  await storage.set(STORAGE_KEYS.focusBlockedApps, JSON.stringify(['com.video']));
});

describe('blocking', () => {
  it('blocks the chosen apps while a course is open and unblocks on leaving', async () => {
    await courseFocus.enter('course');
    expect(mockBlocker.setBlockedApps).toHaveBeenLastCalledWith(['com.video']);
    expect(mockBlocker.startMonitoring).toHaveBeenCalled();
    expect(await isBlocking()).toBe(true);

    await courseFocus.leave('course');
    expect(mockBlocker.setBlockedApps).toHaveBeenLastCalledWith([]);
    expect(mockBlocker.stopMonitoring).toHaveBeenCalled();
    expect(await isBlocking()).toBe(false);
  });

  it.each([
    ['no apps are picked', () => storage.set(STORAGE_KEYS.focusBlockedApps, '[]')],
    ['permissions are missing', async () => void grant(false)],
    ['the settings switch is off', () => storage.set(STORAGE_KEYS.focusEnabled, 'false')],
  ])('blocks nothing when %s', async (_case, arrange) => {
    await arrange();
    await courseFocus.enter('course');
    expect(mockBlocker.startMonitoring).not.toHaveBeenCalled();
    expect(await isBlocking()).toBe(false);
  });

  it('keeps blocking when one course is left right after another is entered', async () => {
    await courseFocus.enter('first');
    courseFocus.enter('second');
    await courseFocus.leave('first');
    expect(await isBlocking()).toBe(true);
  });

  it('clears blocking left on by a killed app, but not an open course', async () => {
    await storage.set(STORAGE_KEYS.focusIsActive, 'true');
    await courseFocus.resetStale();
    expect(mockBlocker.stopMonitoring).toHaveBeenCalled();
    expect(await isBlocking()).toBe(false);

    await courseFocus.enter('course');
    await courseFocus.resetStale();
    expect(await isBlocking()).toBe(true);
  });

  it('turning the settings switch off unblocks at once', async () => {
    await courseFocus.enter('course');
    await focusApi.setEnabled(false);
    expect(mockBlocker.stopMonitoring).toHaveBeenCalled();
    expect(await isBlocking()).toBe(false);
  });
});

describe('reminders', () => {
  it('schedules a reminder on leaving the app and cancels it on return', async () => {
    await courseFocus.enter('course');
    await courseFocus.appBackgrounded('course');
    expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ data: { course: 'course' } }),
        trigger: expect.objectContaining({ seconds: 30 }),
      }),
    );

    await courseFocus.appForegrounded();
    expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('reminder');
  });

  it('cancels a pending reminder when the course is left', async () => {
    await courseFocus.enter('course');
    await courseFocus.appBackgrounded('course');
    await courseFocus.leave('course');
    expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('reminder');
  });

  it('sends no reminder when the settings switch is off', async () => {
    await storage.set(STORAGE_KEYS.focusEnabled, 'false');
    await courseFocus.enter('course');
    await courseFocus.appBackgrounded('course');
    expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
