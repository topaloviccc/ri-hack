import type { CoverImage, Difficulty } from '@/features/courses/types';

export type CountryResponse = {
  code: string;
  name: string;
  flagUrl: string;
  courseCount: number;
  locationCount: number;
};

export type LocationResponse = {
  coverImage?: CoverImage | null;
  coverImagePending?: boolean;
  geocoderAttribution?: string | null;
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  lat: number | null;
  lng: number | null;
};

export type CourseResponse = {
  coverImage?: CoverImage | null;
  coverImagePending?: boolean;
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
};
