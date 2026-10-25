import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { useLearningFields, useSaveInterests } from './interests.api';

type Props = { initialIds: string[]; onboarding?: boolean; onSaved?: () => void };

export function InterestPicker({ initialIds, onboarding = false, onSaved }: Props) {
  const fields = useLearningFields();
  const save = useSaveInterests();
  const [selected, setSelected] = useState(initialIds);

  const submit = (ids: string[]) => save.mutate(ids, { onSuccess: () => onSaved?.() });

  if (fields.isPending) return <LoadingState />;
  if (fields.isError) return <ErrorState onRetry={fields.refetch} />;

  return (
    <ScrollView contentContainerClassName="flex-grow justify-center gap-6 p-6">
      <View className="gap-2">
        <Text variant="title" accessibilityRole="header">
          What do you want to explore?
        </Text>
        <Text variant="body">
          Choose the topics you enjoy. Your feed will adapt as you explore courses.
        </Text>
        <Text variant="caption">Pick as many as you like. You can change these in Settings.</Text>
      </View>
      <View className="flex-row flex-wrap gap-3">
        {fields.data.map((field) => {
          const checked = selected.includes(field.id);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="checkbox"
              accessibilityLabel={field.label}
              accessibilityState={{ checked, disabled: save.isPending }}
              disabled={save.isPending}
              onPress={() =>
                setSelected((ids) =>
                  checked ? ids.filter((id) => id !== field.id) : [...ids, field.id],
                )
              }
              className="min-h-11 justify-center"
            >
              <Chip label={field.label} variant={checked ? 'selected' : 'neutral'} />
            </Pressable>
          );
        })}
      </View>
      {fields.data.length === 0 ? (
        <Text variant="caption">No topics are available yet. You can add interests later.</Text>
      ) : null}
      {save.isError ? (
        <Text accessibilityRole="alert" className="text-primary">
          {save.error.message}
        </Text>
      ) : null}
      <Button
        label={save.isPending ? 'Saving…' : onboarding ? 'Start exploring' : 'Save interests'}
        disabled={save.isPending}
        onPress={() => submit(selected)}
        className="self-stretch"
      />
      {onboarding ? (
        <Button
          label="Skip for now"
          variant="soft"
          disabled={save.isPending}
          onPress={() => submit([])}
          className="self-stretch"
        />
      ) : null}
    </ScrollView>
  );
}
