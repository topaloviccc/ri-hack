import { countriesApi, coursesApi, locationsApi } from './courses.api';
import type { CourseResponse } from './courses.dto';
import { httpResponse } from '@/test-support/api-fixture';

describe('course HTTP mapping', () => {
  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });
  const row: CourseResponse = {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'A real course',
    subject: 'A database field',
    countryCode: null,
    countryName: null,
    description: null,
    estimatedMinutes: null,
    locations: [
      {
        id: '70000000-0000-0000-0000-000000000001',
        name: 'A real place',
        countryCode: 'ME',
        countryName: 'Montenegro',
        lat: null,
        lng: null,
        imageUrl: null,
        kind: 'castle',
        city: null,
        geocoderAttribution: null,
        coverImage: null,
        coverImagePending: false,
      },
    ],
    difficulty: 'beginner',
    learnerCount: 7,
    progress: null,
    unlockCost: 73,
    isUnlocked: true,
    imageUrl: null,
    coverImage: null,
    coverImagePending: false,
  };

  it('preserves server prices, ownership, arbitrary subjects and nullable details', async () => {
    fetchMock.mockResolvedValue(httpResponse(row));
    const result = await coursesApi.getById(row.id);
    expect(result).toMatchObject({
      id: row.id,
      title: row.title,
      unlockCost: 73,
      isUnlocked: true,
      subject: row.subject,
      estimatedMinutes: null,
      progress: undefined,
    });
    // No invented images, and unknown place kinds become null (rendered as a generic place).
    expect(result.locations[0]).toMatchObject({
      name: 'A real place',
      lat: null,
      lng: null,
      kind: null,
      city: null,
    });
    expect(result.imageUrl).toBeNull();
  });

  it('fetches actual country counts and does not substitute missing resources', async () => {
    fetchMock.mockResolvedValueOnce(
      httpResponse({
        code: 'ME',
        name: 'Montenegro',
        flagUrl: 'https://flagcdn.com/w160/me.png',
        courseCount: 2,
        locationCount: 1,
        blurb: null,
      }),
    );
    expect(await countriesApi.getByCode('ME')).toMatchObject({
      code: 'ME',
      name: 'Montenegro',
      flagUrl: 'https://flagcdn.com/w160/me.png',
      courseCount: 2,
      locationCount: 1,
      blurb: null,
    });
    fetchMock.mockResolvedValueOnce(httpResponse({ detail: 'Location not found' }, 404));
    await expect(locationsApi.getById('missing')).rejects.toMatchObject({ status: 404 });
  });

  it('prefers a retrieved photo over the stored image and keeps its attribution', async () => {
    const coverImage = {
      url: 'https://upload.wikimedia.org/castle.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Castle.jpg',
      author: 'A real photographer',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      caption: 'A real castle',
      width: 1280,
      height: 850,
    };
    const stored = 'https://example.test/stored.jpg';
    fetchMock.mockResolvedValue(
      httpResponse({
        ...row,
        imageUrl: stored,
        coverImage,
        locations: [{ ...row.locations[0], imageUrl: stored, coverImage }],
      }),
    );
    const course = await coursesApi.getById(row.id);
    expect(course.imageUrl).toBe(coverImage.url);
    expect(course.coverImage).toEqual(coverImage);
    expect(course.locations[0].imageUrl).toBe(coverImage.url);
    expect(course.locations[0].coverImage?.author).toBe('A real photographer');
  });

  it('falls back to the stored image while no photo has been retrieved', async () => {
    const stored = 'https://example.test/stored.jpg';
    fetchMock.mockResolvedValue(
      httpResponse({ ...row, imageUrl: stored, coverImagePending: true }),
    );
    const course = await coursesApi.getById(row.id);
    expect(course.imageUrl).toBe(stored);
    expect(course.coverImagePending).toBe(true);
  });
});
