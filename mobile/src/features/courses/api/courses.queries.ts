import { queryOptions, useQuery } from '@tanstack/react-query';

import { countriesApi, coursesApi, locationsApi } from '@/features/courses/api/courses.api';
import type { CourseFilters, LocationFilters } from '@/features/courses/types';

export const courseKeys = {
  all: ['courses'] as const,
  list: (f: CourseFilters = {}) => [...courseKeys.all, 'list', f] as const,
  detail: (id: string) => [...courseKeys.all, 'detail', id] as const,
};

export const locationKeys = {
  all: ['locations'] as const,
  list: (f: LocationFilters = {}) => [...locationKeys.all, 'list', f] as const,
  detail: (id: string) => [...locationKeys.all, 'detail', id] as const,
};

export const countryKeys = {
  all: ['countries'] as const,
  list: () => [...countryKeys.all, 'list'] as const,
  detail: (code: string) => [...countryKeys.all, 'detail', code] as const,
};

export const courseListQueryOptions = (f: CourseFilters = {}) =>
  queryOptions({ queryKey: courseKeys.list(f), queryFn: () => coursesApi.list(f) });

export const courseQueryOptions = (id: string) =>
  queryOptions({ queryKey: courseKeys.detail(id), queryFn: () => coursesApi.getById(id) });

export const locationListQueryOptions = (f: LocationFilters = {}) =>
  queryOptions({ queryKey: locationKeys.list(f), queryFn: () => locationsApi.list(f) });

export const locationQueryOptions = (id: string) =>
  queryOptions({ queryKey: locationKeys.detail(id), queryFn: () => locationsApi.getById(id) });

export const countryListQueryOptions = () =>
  queryOptions({ queryKey: countryKeys.list(), queryFn: () => countriesApi.list() });

export const countryQueryOptions = (code: string) =>
  queryOptions({ queryKey: countryKeys.detail(code), queryFn: () => countriesApi.getByCode(code) });

export const useCoursesQuery = (f: CourseFilters = {}) => useQuery(courseListQueryOptions(f));

export const useCourseQuery = (id: string) => useQuery(courseQueryOptions(id));

export const useLocationsQuery = (f: LocationFilters = {}) => useQuery(locationListQueryOptions(f));

export const useLocationQuery = (id: string) => useQuery(locationQueryOptions(id));

export const useCountriesQuery = () => useQuery(countryListQueryOptions());

export const useCountryQuery = (code: string) => useQuery(countryQueryOptions(code));
