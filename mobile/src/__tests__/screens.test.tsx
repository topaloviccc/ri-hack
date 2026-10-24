import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import {
  MOCK_COUNTRIES,
  MOCK_COURSES,
  MOCK_FEED_IDS,
  MOCK_LOCATIONS,
} from '@/features/courses/api/courses.mock';
import { MOCK_EVENTS } from '@/features/events/api/events.mock';
import { isCourseUnlocked } from '@/features/wallet/api/wallet.mock';

// Smoke tests: boot the real app at each route and check its key content renders.
// Relative to the jest rootDir.
const APP_DIR = './src/app';
const courseTitle = (id: string) => MOCK_COURSES.find((c) => c.id === id)?.title ?? '';

const renderAt = (initialUrl: string) => renderRouter(APP_DIR, { initialUrl });

describe('screens', () => {
  it('Home shows the three course rows', async () => {
    await renderAt('/');
    expect(await screen.findByText('Continue with…')).toBeOnTheScreen();
    expect(screen.getByText('Most Popular')).toBeOnTheScreen();
    expect(screen.getByText('Recommended for you')).toBeOnTheScreen();
    expect((await screen.findAllByLabelText(/^Open course /)).length).toBeGreaterThan(0);
  });

  it('Home course cards show learner counts', async () => {
    await renderAt('/');
    expect((await screen.findAllByText(/learners$/)).length).toBeGreaterThan(0);
  });

  it('Scroll shows the first reel', async () => {
    await renderAt('/scroll');
    // The feed sizes reels from its measured height; jest has no layout pass.
    await fireEvent(await screen.findByTestId('course-feed'), 'layout', {
      nativeEvent: { layout: { width: 400, height: 800 } },
    });
    expect(await screen.findByText(courseTitle(MOCK_FEED_IDS[0]))).toBeOnTheScreen();
  });

  it('Events shows the location picker and today’s events', async () => {
    await renderAt('/events');
    expect(await screen.findByText('Events')).toBeOnTheScreen();
    expect(screen.getByLabelText('Use my location')).toBeOnTheScreen();
    expect((await screen.findAllByLabelText(/ in maps$/)).length).toBeGreaterThan(0);
  });

  it('Network shows friends, feed, challenge and suggestions', async () => {
    await renderAt('/network');
    expect(await screen.findByText('My friends')).toBeOnTheScreen();
    expect(await screen.findByText('My feed')).toBeOnTheScreen();
    expect(await screen.findByText('Weekly challenge')).toBeOnTheScreen();
    expect(await screen.findByText('Suggested friends')).toBeOnTheScreen();
  });

  it('Network leaderboard marks your own row', async () => {
    await renderAt('/network');
    await fireEvent.press(await screen.findByText('Leaderboards'));
    expect(await screen.findByText(/\(you\)$/)).toBeOnTheScreen();
  });

  it('Courses renders the world map', async () => {
    await renderAt('/courses');
    await fireEvent(await screen.findByTestId('world-map'), 'layout', {
      nativeEvent: { layout: { width: 400, height: 700 } },
    });
    expect(await screen.findByLabelText(/^World map/)).toBeOnTheScreen();
    // Every country with courses gets a chip like "🇪🇸 5".
    expect(await screen.findAllByLabelText(/: \d+ courses$/)).toHaveLength(MOCK_COUNTRIES.length);
  });

  it('Courses Countries lists countries A–Z', async () => {
    await renderAt('/courses');
    await fireEvent.press(await screen.findByText('Countries'));
    // Only the first rows are guaranteed to render, so check the alphabetically first one.
    const [first] = MOCK_COUNTRIES.map((c) => c.name).sort((a, b) => a.localeCompare(b));
    expect(await screen.findByLabelText(new RegExp(`^${first}: \\d+ courses`))).toBeOnTheScreen();
  });

  it('Courses Fields groups courses by subject', async () => {
    await renderAt('/courses');
    await fireEvent.press(await screen.findByText('Fields'));
    // Group headers read "<subject> · <count>".
    expect(await screen.findByText(/^Nature & Wildlife · \d+$/)).toBeOnTheScreen();
    expect((await screen.findAllByLabelText(/^Open course /)).length).toBeGreaterThan(0);
  });

  it('Country page shows the blurb and its courses', async () => {
    const country = MOCK_COUNTRIES[0];
    await renderAt(`/country/${country.code}`);
    expect(await screen.findByText(country.blurb)).toBeOnTheScreen();
    expect((await screen.findAllByLabelText(/^Open course /)).length).toBeGreaterThan(0);
  });

  it('Course details shows the title and estimated length', async () => {
    await renderAt('/course/c1');
    expect((await screen.findAllByText(courseTitle('c1'))).length).toBeGreaterThan(0);
    expect(screen.getByText('Estimated length')).toBeOnTheScreen();
  });

  it('Event details shows the title and a Register button', async () => {
    await renderAt('/event/e1');
    expect((await screen.findAllByText(MOCK_EVENTS[0].title)).length).toBeGreaterThan(0);
    expect(screen.getByText('Register')).toBeOnTheScreen();
  });

  it('Location sheet shows the site and its courses', async () => {
    const location = MOCK_LOCATIONS[0];
    await renderAt(`/location/${location.id}`);
    expect(await screen.findByText(location.name)).toBeOnTheScreen();
    expect(screen.getByText('Open in maps')).toBeOnTheScreen();
    expect((await screen.findAllByLabelText(/^Open course /)).length).toBeGreaterThan(0);
  });

  it('Course details lists its places', async () => {
    const course = MOCK_COURSES.find((c) => c.locationIds.length > 0);
    if (!course) throw new Error('mock data has no course with locations');
    await renderAt(`/course/${course.id}`);
    expect(await screen.findByText('Places')).toBeOnTheScreen();
    expect(screen.getByText('Country')).toBeOnTheScreen();
  });

  it('Own profile shows Edit profile and in-progress courses', async () => {
    await renderAt('/profile');
    expect(await screen.findByText('Edit profile')).toBeOnTheScreen();
    expect(screen.getByText('In progress')).toBeOnTheScreen();
    expect(screen.getByText('Coins')).toBeOnTheScreen();
  });

  it('Tab headers show the coin balance', async () => {
    await renderAt('/');
    expect(await screen.findByLabelText(/^\d+ coins$/)).toBeOnTheScreen();
  });

  it('Unlocking a locked course spends coins and celebrates', async () => {
    const locked = MOCK_COURSES.find((c) => !isCourseUnlocked(c.id));
    if (!locked) throw new Error('mock data has no locked course');
    await renderAt(`/course/${locked.id}`);
    await fireEvent.press(await screen.findByLabelText(/^Unlock for \d+ coins$/));
    // The sheet shows cost, balance and the balance afterwards.
    expect(await screen.findByText('After unlocking')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText(/^Unlock for \d+ coins$/));
    expect(await screen.findByText('Course unlocked!')).toBeOnTheScreen();
    expect(await screen.findByText('Start course')).toBeOnTheScreen();
  });

  it('Another user: adding a friend moves to Requested, with no In progress section', async () => {
    await renderAt('/user/u8');
    const add = await screen.findByLabelText('Add Ivan Perović as a friend');
    await fireEvent.press(add);
    expect(await screen.findByText('Requested')).toBeOnTheScreen();
    expect(screen.queryByText('In progress')).not.toBeOnTheScreen();
  });

  it('Settings shows the appearance options', async () => {
    await renderAt('/settings');
    expect(await screen.findByText('Appearance')).toBeOnTheScreen();
    expect(screen.getByText('Dark')).toBeOnTheScreen();
    expect(screen.getByText('Become an expert')).toBeOnTheScreen();
    expect(await screen.findByText(/^Check request status/)).toBeOnTheScreen();
  });

  it('Expert form shows an error per missing field', async () => {
    await renderAt('/settings');
    await fireEvent.press(await screen.findByText('Become an expert'));
    await fireEvent.press(await screen.findByText('Submit request'));
    expect(await screen.findByText('Choose a field.')).toBeOnTheScreen();
    expect(screen.getByText('Upload a certificate.')).toBeOnTheScreen();
    // Title is pre-filled from the latest request, so it has no error.
    expect(screen.queryByText('Add your title.')).toBeNull();
  });

  it('Expert requests list shows statuses and rejection reasons', async () => {
    await renderAt('/settings');
    await fireEvent.press(await screen.findByText(/^Check request status/));
    expect(await screen.findByText('Approved')).toBeOnTheScreen();
    expect(screen.getByText('Rejected')).toBeOnTheScreen();
    expect(screen.getByText(/^Reason: /)).toBeOnTheScreen();
  });

  it('People shows suggestions', async () => {
    await renderAt('/people');
    expect(await screen.findByText('Suggested for you')).toBeOnTheScreen();
  });
});
