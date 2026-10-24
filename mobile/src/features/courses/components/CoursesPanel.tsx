import { useState, type ComponentType } from 'react';
import { View } from 'react-native';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
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

export function CoursesPanel() {
  const [mode, setMode] = useState<Mode>('map');
  const Panel = PANELS[mode];
  return (
    <View className="flex-1 gap-3">
      <SegmentedControl options={MODES} value={mode} onChange={setMode} className="mx-4" />
      <Panel />
    </View>
  );
}
