import type { CountryResponse, CourseResponse, LocationResponse } from './courses.dto';
import {
  isLocationKind,
  type Country,
  type Course,
  type CourseFilters,
  type CourseGeneration,
  type Location,
  type LocationFilters,
} from '@/features/courses/types';
import { apiRequest } from '@/lib/api-client';

// A retrieved Commons photo (shown with its credit) beats the stored display image.
const preferredImageUrl = (row: { coverImage?: { url: string } | null; imageUrl: string | null }) =>
  row.coverImage?.url ?? row.imageUrl;

const toLocation = (row: LocationResponse): Location => ({
  ...row,
  kind: isLocationKind(row.kind) ? row.kind : null,
  imageUrl: preferredImageUrl(row),
});
const toCourse = (row: CourseResponse): Course => ({
  ...row,
  imageUrl: preferredImageUrl(row),
  subject: row.subject ?? 'Uncategorized',
  countryCode: row.countryCode ?? '',
  countryName: row.countryName ?? 'Country not specified',
  description: row.description ?? '',
  locations: row.locations.map(toLocation),
  progress: row.progress ?? undefined,
});
const toCountry = (row: CountryResponse): Country => row;

export const coursesApi = {
  generate: (query: string): Promise<CourseGeneration> =>
    apiRequest('/course-generations', { method: 'POST', body: { query } }),
  generation: async (query: string): Promise<CourseGeneration | null> =>
    (await apiRequest<CourseGeneration | null>('/course-generations', { query: { query } })) ??
    null,
  list: async (filters: CourseFilters = {}): Promise<Course[]> => {
    const rows = await apiRequest<CourseResponse[]>('/courses', { query: filters });
    return rows.map(toCourse);
  },
  getById: async (id: string): Promise<Course> =>
    toCourse(await apiRequest<CourseResponse>(`/courses/${encodeURIComponent(id)}`)),
  dismiss: (id: string): Promise<void> =>
    apiRequest(`/courses/${encodeURIComponent(id)}/dismiss`, { method: 'POST' }),
  feedback: (id: string, action: 'OPEN' | 'NEXT', dwellMs: number): Promise<void> =>
    apiRequest(`/courses/${encodeURIComponent(id)}/feedback`, {
      method: 'POST',
      body: { action, dwellMs },
    }),
};

export const locationsApi = {
  list: async (filters: LocationFilters = {}): Promise<Location[]> =>
    (await apiRequest<LocationResponse[]>('/locations', { query: filters })).map(toLocation),
  getById: async (id: string): Promise<Location> =>
    toLocation(await apiRequest<LocationResponse>(`/locations/${encodeURIComponent(id)}`)),
};

export const countriesApi = {
  list: async (): Promise<Country[]> =>
    (await apiRequest<CountryResponse[]>('/countries')).map(toCountry),
  getByCode: async (code: string): Promise<Country> =>
    toCountry(await apiRequest<CountryResponse>(`/countries/${encodeURIComponent(code)}`)),
};
