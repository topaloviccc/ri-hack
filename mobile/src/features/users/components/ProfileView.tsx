import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { CourseListItem, useCoursesQuery, useOpenCourse } from '@/features/courses';
import { useUserQuery } from '@/features/users/api/users.queries';
import { useWalletQuery } from '@/features/wallet';
import { ProfileHeader } from '@/features/users/components/ProfileHeader';

type CourseSectionProps = { title: string; ids: string[]; emptyMessage: string };

function CourseSection({ title, ids, emptyMessage }: CourseSectionProps) {
  const { data, isPending, isError, refetch } = useCoursesQuery({ ids });
  const { openCourse, prefetchCourse } = useOpenCourse();

  const renderBody = () => {
    if (ids.length === 0) return <Text variant="caption">{emptyMessage}</Text>;
    if (isPending) return <LoadingState />;
    if (isError) return <ErrorState onRetry={refetch} />;
    // Profiles show a handful of courses, so a plain column is fine inside the page ScrollView.
    return data.map((course) => (
      <CourseListItem
        key={course.id}
        course={course}
        onPress={openCourse}
        onPressIn={prefetchCourse}
      />
    ));
  };

  return (
    <View className="gap-3">
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      {renderBody()}
    </View>
  );
}

export type ProfileViewProps = { userId: string };

/** One profile page for everyone; your own adds in-progress courses and owner actions. */
export function ProfileView({ userId }: ProfileViewProps) {
  const { data: user, isPending, isError, refetch } = useUserQuery(userId);
  const wallet = useWalletQuery();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState message="Couldn't load this profile." onRetry={refetch} />;

  const isOwn = user.relation === 'me';
  return (
    <ScrollView contentContainerClassName="gap-6 p-4 pb-10">
      <ProfileHeader user={user} coins={isOwn ? wallet.data?.balance : undefined} />
      {/* TODO(hack): privacy rules for other people's profiles come with the backend. See BACKLOG.md. */}
      {isOwn ? (
        <CourseSection
          title="In progress"
          ids={user.inProgressCourseIds}
          emptyMessage="Nothing in progress. Pick a course to start!"
        />
      ) : null}
      <CourseSection
        title="Completed"
        ids={user.completedCourseIds}
        emptyMessage="No completed courses yet."
      />
    </ScrollView>
  );
}
