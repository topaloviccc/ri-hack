import { Linking, ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { Hero } from '@/components/shared/Hero';
import { InfoRow } from '@/components/shared/InfoRow';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { useEventQuery } from '@/features/events/api/events.queries';
import { CATEGORY_ICONS, CATEGORY_LABELS, LANGUAGE_NAMES } from '@/features/events/categories';
import { formatDayHeading, formatTime, toDateKey } from '@/utils/date';
import { openInMaps } from '@/utils/open-in-maps';

export type EventDetailsProps = { id: string };

export function EventDetails({ id }: EventDetailsProps) {
  const { data: event, isPending, isError, refetch } = useEventQuery(id);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState message="Couldn't load this event." onRetry={refetch} />;

  const day = formatDayHeading(toDateKey(new Date(event.startsAt)));

  return (
    <ScrollView contentContainerClassName="pb-10">
      <Hero
        imageUrl={event.imageUrl}
        title={event.title}
        eyebrow={<Chip label={CATEGORY_LABELS[event.category]} />}
      />
      <View className="gap-5 p-4">
        <Button
          label="Register"
          accessibilityHint="Opens the organizer's registration page"
          onPress={() => Linking.openURL(event.registrationUrl)}
          className="self-stretch"
        />
        <Text variant="body">{event.description}</Text>
        <View className="gap-2">
          <InfoRow
            icon="calendar-outline"
            label="When"
            value={`${day}, ${formatTime(event.startsAt)}`}
          />
          <InfoRow
            icon="location-outline"
            label="Where"
            value={`${event.venue}, ${event.city}`}
            onPress={() => openInMaps(event.lat, event.lng, `${event.title}, ${event.venue}`)}
          />
          <InfoRow
            icon={CATEGORY_ICONS[event.category]}
            label="Organizer"
            value={event.organizer}
          />
          <InfoRow
            icon="pricetag-outline"
            label="Price"
            value={event.priceEur === null ? 'Free' : `€${event.priceEur}`}
          />
          <InfoRow
            icon="language-outline"
            label="Language"
            value={LANGUAGE_NAMES[event.language] ?? event.language}
          />
        </View>
      </View>
    </ScrollView>
  );
}
