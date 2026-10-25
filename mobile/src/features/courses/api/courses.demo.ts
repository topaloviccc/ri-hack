import { MOCK_COUNTRIES, MOCK_LOCATIONS } from './courses.mock';
import { demoSample } from '@/utils/demo-sample';

export const demoLocationDetails = (id: string) => {
  const { kind, city } = demoSample(id, MOCK_LOCATIONS);
  return { kind, city };
};
export const demoCountryBlurb = (code: string) =>
  MOCK_COUNTRIES.find((country) => country.code === code)?.blurb ??
  'Discover new places and ideas, one course at a time.';
