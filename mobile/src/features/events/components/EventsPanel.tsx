import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { DemoNotice } from '@/components/shared/DemoNotice';
import { Text } from '@/components/ui/Text';
import { useEventsQuery } from '@/features/events/api/events.queries';
import { EventCalendar } from '@/features/events/components/EventCalendar';
import { EventRow } from '@/features/events/components/EventRow';
import { LocationPicker } from '@/features/events/components/LocationPicker';
import type { LearningEvent } from '@/features/events/types';
import { formatDayHeading, toDateKey } from '@/utils/date';
import { openInMaps } from '@/utils/open-in-maps';
import { hasCoordinates } from '@/utils/has-coordinates';

export function EventsPanel() {
  const [city, setCity] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const { data, isPending, isError, refetch } = useEventsQuery({ city });

  const handleOpenMap = useCallback((e: LearningEvent) => {
    if (hasCoordinates(e)) openInMaps(e.lat, e.lng, `${e.title}, ${e.venue}`);
  }, []);

  const handleOpenEvent = useCallback(
    (id: string) => router.push({ pathname: '/event/[id]', params: { id } }),
    [],
  );

  const events = data ?? [];
  const eventDates = [...new Set(events.map((e) => toDateKey(new Date(e.startsAt))))];
  const dayEvents = events.filter((e) => toDateKey(new Date(e.startsAt)) === selectedDate);

  const renderEmpty = () => {
    if (isPending) return <LoadingState />;
    if (isError) return <ErrorState onRetry={refetch} />;
    return (
      <EmptyState
        title="No events this day"
        message={city ? `Try another day in the demo city ${city}.` : 'Try another day.'}
      />
    );
  };

  return (
    <FlatList
      data={dayEvents}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => (
        <EventRow event={item} onPress={handleOpenEvent} onOpenMap={handleOpenMap} />
      )}
      ListEmptyComponent={renderEmpty}
      contentContainerClassName="gap-3 px-4 pb-6"
      ListHeaderComponent={
        <View className="gap-4">
          <DemoNotice>
            cities and city filters, categories, images, languages and paid prices
          </DemoNotice>
          <LocationPicker city={city} onSelectCity={setCity} />
          <EventCalendar
            selectedDate={selectedDate}
            eventDates={eventDates}
            onSelectDate={setSelectedDate}
          />
          <View>
            <Text variant="heading" className="text-2xl">
              {formatDayHeading(selectedDate)}
            </Text>
            {data ? (
              <Text variant="caption">
                {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
              </Text>
            ) : null}
          </View>
        </View>
      }
    />
  );
}
