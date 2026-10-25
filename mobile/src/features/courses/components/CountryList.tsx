import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { useCountriesQuery } from '@/features/courses/api/courses.queries';
import { useThemeColors } from '@/lib/theme';
import { CountryFlag } from '@/components/shared/CountryFlag';
import { pluralize } from '@/utils/format';

/** Courses tab, Countries mode: A–Z rows that open the Country page. */
export function CountryList() {
  const colors = useThemeColors();
  const { data, isPending, isError, refetch } = useCountriesQuery();

  const renderEmpty = () => {
    if (isPending) return <LoadingState />;
    if (isError) return <ErrorState onRetry={refetch} />;
    return <EmptyState title="No countries yet" />;
  };

  return (
    <FlatList
      // Countries with nothing to open (no courses, no places) are left out.
      data={(data ?? []).filter((c) => c.courseCount > 0 || c.locationCount > 0)}
      keyExtractor={(c) => c.code}
      contentContainerClassName="gap-3 px-4 pb-8"
      ListEmptyComponent={renderEmpty}
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.name}: ${pluralize(item.courseCount, 'course')}, ${pluralize(item.locationCount, 'place')}`}
          onPress={() => router.push({ pathname: '/country/[code]', params: { code: item.code } })}
          className="flex-row items-center gap-3 rounded-card border border-border bg-surface p-4 active:opacity-80"
        >
          <CountryFlag code={item.code} name={item.name} uri={item.flagUrl} size="md" />
          <View className="flex-1">
            <Text variant="label" className="text-base">
              {item.name} ({item.code})
            </Text>
            <Text variant="caption">
              {pluralize(item.courseCount, 'course')} · {pluralize(item.locationCount, 'place')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
      )}
    />
  );
}
