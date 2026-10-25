import type { Difficulty } from '@/features/courses/types';

export type CountryResponse = {
  code: string;
  name: string;
  flagUrl: string;
  courseCount: number;
  locationCount: number;
  blurb: string | null;
};

export type LocationResponse = {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  lat: number | null;
  lng: number | null;
  imageUrl: string | null;
  /** Lowercase code; see LOCATION_KINDS. */
  kind: string | null;
  city: string | null;
};

export type CourseResponse = {
  id: string;
  title: string;
  subject: string | null;
  countryCode: string | null;
  countryName: string | null;
  locations: LocationResponse[];
  description: string | null;
  learnerCount: number;
  estimatedMinutes: number | null;
  difficulty: Difficulty;
  progress: number | null;
  unlockCost: number;
  isUnlocked: boolean;
  imageUrl: string | null;
};
