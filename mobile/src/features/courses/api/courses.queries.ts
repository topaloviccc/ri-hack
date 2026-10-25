import { queryOptions, useQuery } from '@tanstack/react-query';

import { countriesApi, coursesApi, locationsApi } from '@/features/courses/api/courses.api';
import type { CourseFilters, CourseGeneration, LocationFilters } from '@/features/courses/types';

// Cover photos and generated courses are filled in by backend workers; poll only while pending.
const COVER_IMAGE_LIST_POLL_MS = 5000;
const COVER_IMAGE_DETAIL_POLL_MS = 3000;
const GENERATION_POLL_MS = 2000;

type Pollable = { coverImagePending: boolean };
const pollWhileAnyPending = ({ state }: { state: { data?: Pollable[] } }) =>
  state.data?.some((item) => item.coverImagePending) ? COVER_IMAGE_LIST_POLL_MS : false;
const pollWhilePending = ({ state }: { state: { data?: Pollable } }) =>
  state.data?.coverImagePending ? COVER_IMAGE_DETAIL_POLL_MS : false;

export const isGenerating = (generation: CourseGeneration | null | undefined) =>
  generation?.state === 'QUEUED' || generation?.state === 'RUNNING';

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

export const courseGenerationKeys = {
  all: ['course-generation'] as const,
  detail: (query: string) => [...courseGenerationKeys.all, query.toLowerCase()] as const,
};

export const countryKeys = {
  all: ['countries'] as const,
  list: () => [...countryKeys.all, 'list'] as const,
  detail: (code: string) => [...countryKeys.all, 'detail', code] as const,
};

export const courseListQueryOptions = (f: CourseFilters = {}) =>
  queryOptions({
    queryKey: courseKeys.list(f),
    queryFn: () => coursesApi.list(f),
    refetchInterval: pollWhileAnyPending,
  });

export const courseQueryOptions = (id: string) =>
  queryOptions({
    queryKey: courseKeys.detail(id),
    queryFn: () => coursesApi.getById(id),
    refetchInterval: pollWhilePending,
  });

export const locationListQueryOptions = (f: LocationFilters = {}) =>
  queryOptions({
    queryKey: locationKeys.list(f),
    queryFn: () => locationsApi.list(f),
    refetchInterval: pollWhileAnyPending,
  });

export const locationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: locationKeys.detail(id),
    queryFn: () => locationsApi.getById(id),
    refetchInterval: pollWhilePending,
  });

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

/** The viewer's latest generation for this search, or null; polls while it runs. */
export const useCourseGenerationQuery = (query: string) =>
  useQuery({
    queryKey: courseGenerationKeys.detail(query),
    queryFn: () => coursesApi.generation(query),
    refetchInterval: ({ state }) => (isGenerating(state.data) ? GENERATION_POLL_MS : false),
  });
