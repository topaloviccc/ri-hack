import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { useCoursesQuery } from '@/features/courses/api/courses.queries';
import { CourseCard } from '@/features/courses/components/CourseCard';
import { useOpenCourse } from '@/features/courses/hooks/useOpenCourse';
import type { Course, HomeSection } from '@/features/courses/types';

const SECTION_TITLES: Record<HomeSection, string> = {
  continue: 'Continue with…',
  popular: 'Most Popular',
  recommended: 'Recommended for you',
};

const EMPTY_MESSAGES: Record<HomeSection, string> = {
  continue: 'Start a course and it will show up here.',
  popular: 'Nothing popular yet.',
  recommended: 'No recommendations yet.',
};

// Keeps the page from jumping while a row loads or fails.
const ROW_PLACEHOLDER_CLASS = 'h-64';

export type CourseRowProps = { section: HomeSection };

export function CourseRow({ section }: CourseRowProps) {
  const { data, isPending, isError, refetch } = useCoursesQuery({ collection: section });
  const { openCourse, prefetchCourse } = useOpenCourse();

  const renderBody = () => {
    if (isPending) return <LoadingState className={ROW_PLACEHOLDER_CLASS} />;
    if (isError) return <ErrorState onRetry={refetch} className={ROW_PLACEHOLDER_CLASS} />;
    if (data.length === 0) {
      return <EmptyState title="Nothing here yet" message={EMPTY_MESSAGES[section]} />;
    }
    return (
      <FlatList
        horizontal
        data={data}
        keyExtractor={(c: Course) => c.id}
        renderItem={({ item }) => (
          <CourseCard course={item} onPress={openCourse} onPressIn={prefetchCourse} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4"
      />
    );
  };

  return (
    <View className="gap-3">
      <Text variant="heading" className="px-4" accessibilityRole="header">
        {SECTION_TITLES[section]}
      </Text>
      {renderBody()}
    </View>
  );
}
