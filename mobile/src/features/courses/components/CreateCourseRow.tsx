import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useGenerateCourse } from '@/features/courses/api/courses.mutations';
import {
  countryKeys,
  courseKeys,
  isGenerating,
  locationKeys,
  useCourseGenerationQuery,
} from '@/features/courses/api/courses.queries';
import { useOpenCourse } from '@/features/courses/hooks/useOpenCourse';

export type CreateCourseRowProps = { query: string };

/** The single empty-search result; creation always requires an explicit tap. */
export function CreateCourseRow({ query }: CreateCourseRowProps) {
  const queryClient = useQueryClient();
  const { openCourse } = useOpenCourse();
  const job = useCourseGenerationQuery(query);
  const create = useGenerateCourse(query);
  const state = job.data?.state;
  const isBusy = create.isPending || isGenerating(job.data);

  // A finished job published a course and its places; refresh everything that lists them.
  useEffect(() => {
    if (state !== 'READY') return;
    [courseKeys.all, countryKeys.all, locationKeys.all].forEach((key) =>
      queryClient.invalidateQueries({ queryKey: key }),
    );
  }, [queryClient, state]);

  const renderAction = () => {
    if (job.isError) {
      return (
        <>
          <Text accessibilityRole="alert">{job.error.message}</Text>
          <Button variant="soft" label="Check status again" onPress={() => job.refetch()} />
        </>
      );
    }
    const courseId = job.data?.courseId;
    if (courseId) return <Button label="Open course" onPress={() => openCourse(courseId)} />;
    if (state === 'REFUSED') return null;
    const isDisabled = isBusy || job.isPending;
    const idleLabel = state === 'FAILED' ? 'Try creating again' : 'Create course';
    return (
      <Button
        label={isBusy ? 'Creating course…' : idleLabel}
        disabled={isDisabled}
        accessibilityState={{ busy: isBusy, disabled: isDisabled }}
        onPress={() => create.mutate()}
      />
    );
  };

  return (
    <View className="gap-3 rounded-card border border-border bg-surface p-4">
      <Text variant="label" className="text-base">
        Create a course about “{query}”
      </Text>
      <Text className="text-muted">
        {isBusy
          ? 'Creating lessons, quizzes and a final quiz, then checking places. This may take a few minutes.'
          : 'No matching courses. Create one with lessons, quizzes and places to explore. The topic needs a strong connection to one country.'}
      </Text>
      {job.data?.message ? <Text accessibilityRole="alert">{job.data.message}</Text> : null}
      {create.error ? <Text accessibilityRole="alert">{create.error.message}</Text> : null}
      {renderAction()}
    </View>
  );
}
