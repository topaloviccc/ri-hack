import { MOCK_COUNTRIES, MOCK_COURSES, MOCK_LOCATIONS } from './courses.mock';
import { demoSample } from '@/utils/demo-sample';

export const demoCourseImage = (id: string) => demoSample(id, MOCK_COURSES).imageUrl;
export const demoLocationDetails = (id: string) => {
  const { kind, city, imageUrl } = demoSample(id, MOCK_LOCATIONS);
  return { kind, city, imageUrl };
};
export const demoCountryBlurb = (code: string) =>
  MOCK_COUNTRIES.find((country) => country.code === code)?.blurb ??
  'Discover new places and ideas, one course at a time.';
