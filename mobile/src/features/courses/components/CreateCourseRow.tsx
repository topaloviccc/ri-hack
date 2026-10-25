import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { coursesApi } from '@/features/courses/api/courses.api';
import { courseKeys, countryKeys, locationKeys } from '@/features/courses/api/courses.queries';
import { useOpenCourse } from '@/features/courses/hooks/useOpenCourse';

/** The single empty-search result; creation always requires an explicit tap. */
export function CreateCourseRow({ query }: { query: string }) {
  const client = useQueryClient();
  const { openCourse } = useOpenCourse();
  const key = ['course-generation', query.toLowerCase()] as const;
  const job = useQuery({
    queryKey: key,
    queryFn: () => coursesApi.generation(query),
    refetchInterval: ({ state }) =>
      state.data?.state === 'QUEUED' || state.data?.state === 'RUNNING' ? 2000 : false,
  });
  const create = useMutation({
    mutationFn: () => coursesApi.generate(query),
    onSuccess: (data) => client.setQueryData(key, data),
    onError: () => void client.invalidateQueries({ queryKey: courseKeys.all }),
  });
  const state = job.data?.state;
  const busy = create.isPending || state === 'QUEUED' || state === 'RUNNING';
  useEffect(() => {
    if (state !== 'READY') return;
    void client.invalidateQueries({ queryKey: courseKeys.all });
    void client.invalidateQueries({ queryKey: countryKeys.all });
    void client.invalidateQueries({ queryKey: locationKeys.all });
  }, [client, state]);

  return (
    <View className="gap-3 rounded-card border border-border bg-surface p-4">
      <Text variant="label" className="text-base">Create a course about “{query}”</Text>
      <Text className="text-muted">
        {busy
          ? 'Creating lessons, quizzes and a final quiz, then checking places. This may take a few minutes.'
          : 'No matching courses. Create one with lessons, quizzes and places to explore. The topic needs a strong connection to one country.'}
      </Text>
      {job.data?.message ? <Text accessibilityRole="alert">{job.data.message}</Text> : null}
      {create.error ? <Text accessibilityRole="alert">{create.error.message}</Text> : null}
      {job.isError ? (
        <>
          <Text accessibilityRole="alert">{job.error.message}</Text>
          <Button variant="soft" label="Check status again" onPress={() => void job.refetch()} />
        </>
      ) : job.data?.courseId ? (
        <Button label="Open course" onPress={() => openCourse(job.data!.courseId!)} />
      ) : state !== 'REFUSED' ? (
        <Button
          label={busy ? 'Creating course…' : state === 'FAILED' ? 'Try creating again' : 'Create course'}
          disabled={busy || job.isPending}
          accessibilityState={{ busy, disabled: busy || job.isPending }}
          onPress={() => create.mutate()}
        />
      ) : null}
    </View>
  );
}
