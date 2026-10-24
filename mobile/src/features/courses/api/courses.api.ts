import {
  MOCK_COUNTRIES,
  MOCK_COURSES,
  MOCK_FEED_IDS,
  MOCK_LOCATIONS,
  MOCK_SECTION_IDS,
  type MockCountry,
  type MockCourse,
  type MockLocation,
} from '@/features/courses/api/courses.mock';
import type {
  Country,
  Course,
  CourseFilters,
  Location,
  LocationFilters,
} from '@/features/courses/types';
import { isCourseUnlocked, mockUnlockCost } from '@/features/wallet/api/wallet.mock';
import { ApiError } from '@/lib/api-client';
import { mockDelay } from '@/utils/mock-delay';

// TODO(hack): mock backend. Swap these bodies for api-client calls once the API exists. See BACKLOG.md.
const POPULAR_LIMIT = 5;

const countryName = (code: string) => MOCK_COUNTRIES.find((c) => c.code === code)?.name ?? code;

const toLocation = (location: MockLocation): Location => ({
  ...location,
  countryName: countryName(location.countryCode),
});

const toCourse = ({ locationIds, ...course }: MockCourse): Course => ({
  ...course,
  countryName: countryName(course.countryCode),
  locations: MOCK_LOCATIONS.filter((l) => locationIds.includes(l.id)).map(toLocation),
  unlockCost: mockUnlockCost(course.estimatedMinutes),
  isUnlocked: isCourseUnlocked(course.id),
});

const toCountry = (country: MockCountry): Country => ({
  ...country,
  courseCount: MOCK_COURSES.filter((c) => c.countryCode === country.code).length,
  locationCount: MOCK_LOCATIONS.filter((l) => l.countryCode === country.code).length,
});

const byIds = (ids: string[]) =>
  ids
    .map((id) => MOCK_COURSES.find((c) => c.id === id))
    .filter((c): c is MockCourse => !!c)
    .map(toCourse);

const selectCourses = ({ collection, countryCode, locationId, ids }: CourseFilters): Course[] => {
  if (ids) return byIds(ids);
  if (countryCode) return MOCK_COURSES.filter((c) => c.countryCode === countryCode).map(toCourse);
  if (locationId) {
    return MOCK_COURSES.filter((c) => c.locationIds.includes(locationId)).map(toCourse);
  }
  if (collection === 'feed') return byIds(MOCK_FEED_IDS);
  if (collection === 'popular') {
    return [...MOCK_COURSES]
      .sort((a, b) => b.learnerCount - a.learnerCount)
      .slice(0, POPULAR_LIMIT)
      .map(toCourse);
  }
  if (collection) return byIds(MOCK_SECTION_IDS[collection]);
  return MOCK_COURSES.map(toCourse);
};

export const coursesApi = {
  list: async (filters: CourseFilters = {}): Promise<Course[]> => {
    await mockDelay();
    return selectCourses(filters);
  },
  getById: async (id: string): Promise<Course> => {
    await mockDelay();
    const course = MOCK_COURSES.find((c) => c.id === id);
    if (!course) throw new ApiError(404, 'Course not found');
    return toCourse(course);
  },
};

export const locationsApi = {
  list: async ({ countryCode, ids }: LocationFilters = {}): Promise<Location[]> => {
    await mockDelay();
    return MOCK_LOCATIONS.filter(
      (l) => (!countryCode || l.countryCode === countryCode) && (!ids || ids.includes(l.id)),
    ).map(toLocation);
  },
  getById: async (id: string): Promise<Location> => {
    await mockDelay();
    const location = MOCK_LOCATIONS.find((l) => l.id === id);
    if (!location) throw new ApiError(404, 'Location not found');
    return toLocation(location);
  },
};

export const countriesApi = {
  list: async (): Promise<Country[]> => {
    await mockDelay();
    return MOCK_COUNTRIES.map(toCountry).sort((a, b) => a.name.localeCompare(b.name));
  },
  getByCode: async (code: string): Promise<Country> => {
    await mockDelay();
    const country = MOCK_COUNTRIES.find((c) => c.code === code);
    if (!country) throw new ApiError(404, 'Country not found');
    return toCountry(country);
  },
};
