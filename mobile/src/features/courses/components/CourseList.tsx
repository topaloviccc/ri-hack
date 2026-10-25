import { SectionList, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { useCoursesQuery } from '@/features/courses/api/courses.queries';
import { CourseListItem } from '@/features/courses/components/CourseListItem';
import { CreateCourseRow } from '@/features/courses/components/CreateCourseRow';
import { useOpenCourse } from '@/features/courses/hooks/useOpenCourse';
import type { Course } from '@/features/courses/types';

const groupBySubject = (courses: Course[]) =>
  [...new Set(courses.map((course) => course.subject))]
    .sort()
    .map((subject) => ({
      title: subject,
      data: courses.filter((c) => c.subject === subject),
    }))
    .filter((section) => section.data.length > 0);

/** Courses tab, Fields mode: every course grouped by subject. */
export function CourseList({ query = '' }: { query?: string }) {
  const { data, isPending, isError, refetch } = useCoursesQuery(query ? { query } : {});
  const { openCourse, prefetchCourse } = useOpenCourse();

  const renderEmpty = () => {
    if (isPending) return <LoadingState />;
    if (isError) return <ErrorState onRetry={refetch} />;
    if (query) return <CreateCourseRow key={query} query={query} />;
    return <EmptyState title="No courses yet" />;
  };

  return (
    <SectionList
      sections={data ? groupBySubject(data) : []}
      keyExtractor={(c) => c.id}
      stickySectionHeadersEnabled={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-3 px-4 pb-8"
      ListEmptyComponent={renderEmpty()}
      renderSectionHeader={({ section }) => (
        <View className="pt-3">
          <Text variant="heading" accessibilityRole="header">
            {section.title} · {section.data.length}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <CourseListItem course={item} onPress={openCourse} onPressIn={prefetchCourse} />
      )}
    />
  );
}
