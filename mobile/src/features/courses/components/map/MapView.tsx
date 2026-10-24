import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { CountryCard } from '@/features/courses/components/map/CountryCard';
import { CountryChip } from '@/features/courses/components/map/CountryChip';
import { CountryLayer } from '@/features/courses/components/map/CountryLayer';
import { FadeLayer } from '@/features/courses/components/map/FadeLayer';
import { PinLayer } from '@/features/courses/components/map/PinLayer';
import { useMapCamera } from '@/features/courses/hooks/useMapCamera';
import {
  maxCameraWidth,
  startCamera,
  type Box,
  type MapPoint,
  type Viewport,
} from '@/features/courses/map/geometry';
import { countryAt } from '@/features/courses/map/hit-test';
import { WORLD_SHAPES } from '@/features/courses/map/world-shapes';
import type { Country, Location } from '@/features/courses/types';
import { useThemeColors } from '@/lib/theme';

// Zoom bands, as visible map width in map units: chips at continent scale, pins at country scale.
const CHIP_FADE = [
  [60, 0],
  [90, 1],
] as const;
const PIN_FADE = [
  [60, 1],
  [90, 0],
] as const;
const ZOOMED_IN_RATIO = 0.95;

const shapeOf = (code: string) => WORLD_SHAPES.find((s) => s.code === code);

export type MapViewProps = {
  viewport: Viewport;
  countries: Country[];
  locations: Location[];
};

/** Tap a country (or its chip) to fly to it; zoom in to see its sites; tap a site for courses. */
export function MapView({ viewport, countries, locations }: MapViewProps) {
  const colors = useThemeColors();
  const [selectedCode, setSelectedCode] = useState<string>();
  const [settledWidth, setSettledWidth] = useState(() => startCamera(viewport).w);

  const activeCodes = useMemo(
    () => new Set(countries.filter((c) => c.courseCount > 0).map((c) => c.code)),
    [countries],
  );

  // Ocean or a country without courses clears the selection; a highlighted one flies to it.
  const selectCountry = (code: string | undefined): Box | undefined => {
    if (!code || !activeCodes.has(code)) {
      setSelectedCode(undefined);
      return undefined;
    }
    setSelectedCode(code);
    return shapeOf(code)?.bbox;
  };

  const { camera, gesture, focusBox, zoomOut } = useMapCamera(viewport, {
    onTap: (point: MapPoint) => selectCountry(countryAt(point)),
    onSettled: setSettledWidth,
  });

  const handleChipPress = (code: string) => {
    const box = selectCountry(code);
    if (box) focusBox(box);
  };

  const isZoomedIn = settledWidth < maxCameraWidth(viewport) * ZOOMED_IN_RATIO;
  const showsChips = settledWidth > CHIP_FADE[0][0];
  const showsPins = settledWidth < PIN_FADE[1][0];

  return (
    <View className="flex-1">
      <GestureDetector gesture={gesture}>
        <View className="flex-1" accessibilityLabel="World map. Tap a highlighted country.">
          <CountryLayer
            camera={camera}
            viewport={viewport}
            colors={colors}
            activeCodes={activeCodes}
            selectedCode={selectedCode}
          />
        </View>
      </GestureDetector>

      <FadeLayer camera={camera} fade={CHIP_FADE} isInteractive={showsChips}>
        {countries.map((country) => {
          const shape = shapeOf(country.code);
          if (!shape || country.courseCount === 0) return null;
          return (
            <CountryChip
              key={country.code}
              code={country.code}
              name={country.name}
              courseCount={country.courseCount}
              point={{ x: shape.label[0], y: shape.label[1] }}
              camera={camera}
              viewport={viewport}
              onPress={handleChipPress}
            />
          );
        })}
      </FadeLayer>

      {showsPins ? (
        <FadeLayer camera={camera} fade={PIN_FADE} isInteractive>
          <PinLayer
            // A selected country hides every other country's pins until you tap off it.
            locations={
              selectedCode ? locations.filter((l) => l.countryCode === selectedCode) : locations
            }
            camera={camera}
            viewport={viewport}
            settledWidth={settledWidth}
            onFocusGroup={focusBox}
            onOpenLocation={(id) => router.push({ pathname: '/location/[id]', params: { id } })}
          />
        </FadeLayer>
      ) : null}

      {isZoomedIn ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom out to the world"
          onPress={() => {
            setSelectedCode(undefined);
            zoomOut();
          }}
          className="absolute right-4 top-4 h-11 w-11 items-center justify-center rounded-full bg-surface shadow-md shadow-overlay active:opacity-70"
        >
          <Ionicons name="earth" size={22} color={colors.primary} />
        </Pressable>
      ) : null}
      {selectedCode ? <CountryCard code={selectedCode} /> : null}
    </View>
  );
}
