import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { Hero } from '@/components/shared/Hero';
import { InfoRow } from '@/components/shared/InfoRow';
import { LoadingState } from '@/components/shared/LoadingState';
import { CoverImageCredit } from '@/features/courses/components/CoverImageCredit';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { CoinIcon } from '@/components/ui/CoinIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { useCourseQuery } from '@/features/courses/api/courses.queries';
import { CourseMeta } from '@/features/courses/components/CourseMeta';
import { LocationRow } from '@/features/courses/components/LocationItems';
import { LockBadge } from '@/features/courses/components/LockBadge';
import { capitalize, formatDuration, formatNumber, pluralize } from '@/utils/format';

export type CourseDetailsProps = { id: string };

export function CourseDetails({ id }: CourseDetailsProps) {
  const { data: course, isPending, isError, refetch } = useCourseQuery(id);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState message="Couldn't load this course." onRetry={refetch} />;

  const hasStarted = course.progress !== undefined;
  const handleStart = () => router.push({ pathname: '/course/[id]/learn', params: { id } });

  return (
    <ScrollView contentContainerClassName="pb-10">
      <Hero
        imageUrl={course.imageUrl}
        title={course.title}
        eyebrow={
          <View className="flex-row gap-2">
            <Chip label={course.subject} />
            {course.isUnlocked ? null : <LockBadge cost={course.unlockCost} />}
          </View>
        }
      />
      <View className="gap-5 p-4">
        <CoverImageCredit image={course.coverImage} />
        <CourseMeta course={course} />
        {hasStarted ? (
          <View className="gap-1">
            <Text variant="caption">
              {Math.round((course.progress ?? 0) * 100)}% of content completed
            </Text>
            <ProgressBar value={course.progress ?? 0} />
          </View>
        ) : null}
        {course.isUnlocked ? (
          <Button
            label={hasStarted ? 'Continue' : 'Start course'}
            onPress={handleStart}
            className="self-stretch"
          />
        ) : (
          <Button
            label={`Unlock for ${formatNumber(course.unlockCost)}`}
            accessibilityLabel={`Unlock for ${pluralize(course.unlockCost, 'coin')}`}
            icon={<CoinIcon />}
            onPress={() =>
              router.push({ pathname: '/course/[id]/unlock', params: { id: course.id } })
            }
            className="self-stretch"
          />
        )}
        <Text variant="body">{course.description}</Text>
        <View className="gap-2">
          <InfoRow
            icon="flag-outline"
            label="Country"
            value={course.countryName}
            onPress={
              course.countryCode
                ? () =>
                    router.push({
                      pathname: '/country/[code]',
                      params: { code: course.countryCode },
                    })
                : undefined
            }
          />
          <InfoRow
            icon="time-outline"
            label="Estimated length"
            value={
              course.estimatedMinutes === null
                ? 'Not specified'
                : formatDuration(course.estimatedMinutes)
            }
          />
          <InfoRow
            icon="bar-chart-outline"
            label="Difficulty"
            value={capitalize(course.difficulty)}
          />
        </View>
        {course.locations.length > 0 ? (
          <View className="gap-2">
            <Text variant="heading" accessibilityRole="header">
              Places
            </Text>
            {/* At most a handful of places, so a plain column inside the ScrollView is fine. */}
            {course.locations.map((location) => (
              <LocationRow key={location.id} location={location} />
            ))}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
