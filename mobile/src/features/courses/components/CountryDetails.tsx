import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import {
  useCountryQuery,
  useCoursesQuery,
  useLocationsQuery,
} from '@/features/courses/api/courses.queries';
import { CourseListItem } from '@/features/courses/components/CourseListItem';
import { LocationCard } from '@/features/courses/components/LocationItems';
import { useOpenCourse } from '@/features/courses/hooks/useOpenCourse';
import { countryFlag } from '@/utils/flag';

export type CountryDetailsProps = { code: string };

/** Country page: the country's concepts (courses) and the places connected to them. */
export function CountryDetails({ code }: CountryDetailsProps) {
  const country = useCountryQuery(code);
  const locations = useLocationsQuery({ countryCode: code });
  const courses = useCoursesQuery({ countryCode: code });
  const { openCourse, prefetchCourse } = useOpenCourse();

  if (country.isPending || locations.isPending || courses.isPending) return <LoadingState />;
  if (country.isError || locations.isError || courses.isError) {
    return (
      <ErrorState
        onRetry={() => {
          country.refetch();
          locations.refetch();
          courses.refetch();
        }}
      />
    );
  }

  return (
    <FlatList
      data={courses.data}
      keyExtractor={(c) => c.id}
      contentContainerClassName="gap-3 pb-10"
      ListHeaderComponent={
        <View className="gap-4 pb-1">
          <View className="items-center gap-1 px-4 pt-4">
            <Text className="text-6xl">{countryFlag(code)}</Text>
            <Text variant="title" accessibilityRole="header">
              {country.data.name}
            </Text>
            <Text variant="caption">
              {country.data.courseCount} courses · {country.data.locationCount} places
            </Text>
            <Text variant="body" className="mt-2 text-center">
              {country.data.blurb}
            </Text>
          </View>
          {locations.data.length > 0 ? (
            <View className="gap-2">
              <Text variant="heading" className="px-4">
                Places
              </Text>
              <FlatList
                horizontal
                data={locations.data}
                keyExtractor={(l) => l.id}
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-3 px-4"
                renderItem={({ item }) => <LocationCard location={item} />}
              />
            </View>
          ) : null}
          <Text variant="heading" className="px-4">
            Courses
          </Text>
        </View>
      }
      ListEmptyComponent={<EmptyState title="No courses yet" />}
      renderItem={({ item }) => (
        <View className="px-4">
          <CourseListItem course={item} onPress={openCourse} onPressIn={prefetchCourse} />
        </View>
      )}
    />
  );
}
