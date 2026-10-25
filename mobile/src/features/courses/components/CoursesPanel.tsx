import { useEffect, useState, type ComponentType } from 'react';
import { View } from 'react-native';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { CountryList } from '@/features/courses/components/CountryList';
import { CourseList } from '@/features/courses/components/CourseList';
import { WorldMap } from '@/features/courses/components/map/WorldMap';

const MODES = [
  { value: 'map', label: 'Map' },
  { value: 'countries', label: 'Countries' },
  { value: 'fields', label: 'Fields' },
] as const;

type Mode = (typeof MODES)[number]['value'];

const PANELS: Record<Mode, ComponentType> = {
  map: WorldMap,
  countries: CountryList,
  fields: CourseList,
};

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MAX_LENGTH = 200;
const normalizeSearch = (text: string) => text.trim().replace(/\s+/g, ' ');

export function CoursesPanel() {
  const [mode, setMode] = useState<Mode>('map');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(normalizeSearch(query)), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);
  const Panel = PANELS[mode];

  const renderBody = () => {
    if (!normalizeSearch(query)) {
      return (
        <>
          <SegmentedControl options={MODES} value={mode} onChange={setMode} className="mx-4" />
          <Panel />
        </>
      );
    }
    // Show nothing while typing; results appear once the search settles.
    if (search !== normalizeSearch(query)) return null;
    return <CourseList key={search} query={search} />;
  };

  return (
    <View className="flex-1 gap-3">
      <TextField
        className="mx-4"
        value={query}
        onChangeText={setQuery}
        placeholder="Search courses by title or topic"
        accessibilityLabel="Search courses by title or topic"
        returnKeyType="search"
        maxLength={SEARCH_MAX_LENGTH}
      />
      {renderBody()}
    </View>
  );
}
