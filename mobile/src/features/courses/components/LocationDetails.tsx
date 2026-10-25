import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { useCoursesQuery, useLocationQuery } from '@/features/courses/api/courses.queries';
import { CourseListItem } from '@/features/courses/components/CourseListItem';
import { useOpenCourse } from '@/features/courses/hooks/useOpenCourse';
import { locationKindLabel } from '@/features/courses/location-kinds';
import { useThemeColors } from '@/lib/theme';
import { CountryFlag } from '@/components/shared/CountryFlag';
import { hasCoordinates } from '@/utils/has-coordinates';
import { openInMaps } from '@/utils/open-in-maps';

export type LocationDetailsProps = { id: string };

/** Location page: the site and every course connected to it. */
export function LocationDetails({ id }: LocationDetailsProps) {
  const colors = useThemeColors();
  const location = useLocationQuery(id);
  const courses = useCoursesQuery({ locationId: id });
  const { openCourse, prefetchCourse } = useOpenCourse();

  if (location.isPending || courses.isPending) return <LoadingState />;
  if (location.isError || courses.isError) {
    return (
      <ErrorState
        onRetry={() => {
          location.refetch();
          courses.refetch();
        }}
      />
    );
  }

  const site = location.data;
  // A site has only a handful of courses, so a plain column in the ScrollView is fine.
  return (
    <ScrollView contentContainerClassName="gap-3 pb-8">
      <View className="gap-3">
        <Image uri={site.imageUrl} className="h-44 w-full bg-border" />
        <View className="gap-2 px-4">
          <Chip label={locationKindLabel(site.kind)} />
          <Text variant="title" accessibilityRole="header">
            {site.name}
          </Text>
          <View className="flex-row items-center gap-2">
            <CountryFlag code={site.countryCode} name={site.countryName} />
            <Text variant="caption">
              {[site.city, site.countryName].filter(Boolean).join(', ')}
            </Text>
          </View>
          {hasCoordinates(site) ? (
            <Button
              variant="soft"
              label="Open in maps"
              icon={<Ionicons name="navigate-outline" size={16} color={colors.text} />}
              onPress={() => openInMaps(site.lat, site.lng, site.name)}
            />
          ) : null}
          <Text variant="heading" className="mt-2">
            Courses here
          </Text>
        </View>
      </View>
      {courses.data.length === 0 ? <EmptyState title="No courses here yet" /> : null}
      {courses.data.map((course) => (
        <View key={course.id} className="px-4">
          <CourseListItem course={course} onPress={openCourse} onPressIn={prefetchCourse} />
        </View>
      ))}
    </ScrollView>
  );
}
