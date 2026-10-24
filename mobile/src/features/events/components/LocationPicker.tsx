import { Pressable, ScrollView, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { useLocateCity } from '@/features/events/hooks/useLocateCity';
import { CITIES } from '@/features/events/types';

const STATUS_MESSAGES = {
  denied: 'Location permission denied. Pick a city instead.',
  failed: "Couldn't find your city. Pick one instead.",
} as const;

export type LocationPickerProps = {
  city: string;
  onSelectCity: (city: string) => void;
};

export function LocationPicker({ city, onSelectCity }: LocationPickerProps) {
  const { locate, status } = useLocateCity(onSelectCity);
  // A GPS city outside the seeded list still gets its own chip.
  const cities = CITIES.includes(city as (typeof CITIES)[number]) ? CITIES : [city, ...CITIES];
  const options = ['', ...cities.filter(Boolean)];

  return (
    <View className="gap-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Use my location"
          accessibilityState={{ busy: status === 'locating' }}
          disabled={status === 'locating'}
          onPress={locate}
          className="min-h-11 justify-center active:opacity-70"
        >
          <Chip
            label={status === 'locating' ? 'Locating…' : '📍 My location'}
            variant="secondary"
          />
        </Pressable>
        {options.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: option === city }}
            onPress={() => onSelectCity(option)}
            className="min-h-11 justify-center active:opacity-70"
          >
            <Chip
              label={option || 'All cities'}
              variant={option === city ? 'selected' : 'neutral'}
            />
          </Pressable>
        ))}
      </ScrollView>
      {status === 'denied' || status === 'failed' ? (
        <Text variant="caption">{STATUS_MESSAGES[status]}</Text>
      ) : null}
    </View>
  );
}
