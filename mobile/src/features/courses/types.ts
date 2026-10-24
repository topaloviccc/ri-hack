export const SUBJECTS = [
  'Nature & Wildlife',
  'Culture & Traditions',
  'Monuments & Architecture',
  'History',
  'Food & Drink',
  'Arts & Music',
  'Sport & Games',
] as const;

// Course subjects are database field labels; the demo expert form uses SUBJECTS separately.
export type Subject = string;

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const LOCATION_KINDS = ['monument', 'nature', 'museum', 'venue', 'site'] as const;

export type LocationKind = (typeof LOCATION_KINDS)[number];

export const HOME_SECTIONS = ['continue', 'popular', 'recommended'] as const;

export type HomeSection = (typeof HOME_SECTIONS)[number];

/** Home rows plus the Scroll page's reel feed. */
export type CourseCollection = HomeSection | 'feed';

/** All fields optional: no filter lists every course. */
export type CourseFilters = {
  collection?: CourseCollection;
  countryCode?: string;
  locationId?: string;
  ids?: string[];
};

export type LocationFilters = { countryCode?: string; ids?: string[] };

/** A real site (monument, park, arena…). These are the waypoints on the Courses map. */
export type Location = {
  id: string;
  name: string;
  kind: LocationKind;
  /** Town or city, display only */
  city: string;
  /** ISO 3166-1 alpha-2 */
  countryCode: string;
  countryName: string;
  lat: number | null;
  lng: number | null;
  imageUrl: string;
};

export type Country = {
  /** ISO 3166-1 alpha-2 */
  code: string;
  name: string;
  /** Hosted flag image URL supplied by the backend. */
  flagUrl: string;
  blurb: string;
  courseCount: number;
  locationCount: number;
};

/** A concept strongly tied to one country (e.g. bull riding → Spain). */
export type Course = {
  id: string;
  title: string;
  imageUrl: string;
  subject: Subject;
  countryCode: string;
  countryName: string;
  /** Sites connected to the concept; may be empty. */
  locations: Location[];
  description: string;
  learnerCount: number;
  estimatedMinutes: number | null;
  difficulty: Difficulty;
  /** 0..1, present only for owned courses in progress */
  progress?: number;
  /** Coins needed to unlock; set by the server. */
  unlockCost: number;
  /** Viewer-specific: true once the signed-in user has unlocked (or started) it. */
  isUnlocked: boolean;
};
