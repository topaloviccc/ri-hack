import { useState } from 'react';
import { View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { DemoNotice } from '@/components/shared/DemoNotice';
import { useCountriesQuery, useLocationsQuery } from '@/features/courses/api/courses.queries';
import { MapView } from '@/features/courses/components/map/MapView';
import type { Viewport } from '@/features/courses/map/geometry';

/** Courses tab, Map mode. Measures itself, loads data, then hands off to MapView. */
export function WorldMap() {
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const countries = useCountriesQuery();
  const locations = useLocationsQuery();

  const renderBody = () => {
    if (countries.isPending || locations.isPending) return <LoadingState />;
    if (countries.isError || locations.isError) {
      return (
        <ErrorState
          onRetry={() => {
            countries.refetch();
            locations.refetch();
          }}
        />
      );
    }
    if (!viewport) return null;
    return <MapView viewport={viewport} countries={countries.data} locations={locations.data} />;
  };

  return (
    <View
      testID="world-map"
      className="flex-1 overflow-hidden"
      onLayout={({ nativeEvent: { layout } }) =>
        setViewport({ width: layout.width, height: layout.height })
      }
    >
      <DemoNotice>location types</DemoNotice>
      {renderBody()}
    </View>
  );
}
