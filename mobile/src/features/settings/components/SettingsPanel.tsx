import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { useUpdateThemePreference } from '@/features/settings/api/settings.mutations';
import { useThemePreferenceQuery } from '@/features/settings/api/settings.queries';

const THEME_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

export type SettingsPanelProps = {
  /** Extra sections from other features, rendered below Appearance. */
  children?: ReactNode;
};

export function SettingsPanel({ children }: SettingsPanelProps) {
  const { data, isPending, isError, refetch } = useThemePreferenceQuery();
  const update = useUpdateThemePreference();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <ScrollView contentContainerClassName="gap-6 p-4">
      <View className="gap-2">
        <Text variant="heading" accessibilityRole="header">
          Appearance
        </Text>
        <SegmentedControl options={THEME_OPTIONS} value={data} onChange={update.mutate} />
        {update.isError ? (
          <Text variant="caption" className="text-primary">
            Couldn&apos;t save your choice. It will reset on restart.
          </Text>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}
