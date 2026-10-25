import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useSetFocusEnabled } from '@/features/focus/api/focus.mutations';
import {
  useBlockedAppsQuery,
  useFocusEnabledQuery,
  useFocusPermissionsQuery,
} from '@/features/focus/api/focus.queries';
import { useThemeColors } from '@/lib/theme';

/** Settings › Focus while learning (Android only): blocked apps, plus the switch for all of it. */
export function FocusSettingsSection() {
  const colors = useThemeColors();
  const permissions = useFocusPermissionsQuery();
  const blocked = useBlockedAppsQuery();
  const isEnabled = useFocusEnabledQuery();
  const setEnabled = useSetFocusEnabled();

  if (Platform.OS !== 'android') return null;

  const header = (
    <Text variant="heading" accessibilityRole="header">
      Focus while learning
    </Text>
  );
  if (permissions.isPending || isEnabled.isPending) {
    return (
      <View className="gap-2">
        {header}
        <LoadingState />
      </View>
    );
  }
  if (permissions.isError || isEnabled.isError) {
    return (
      <View className="gap-2">
        {header}
        <ErrorState
          onRetry={() => {
            permissions.refetch();
            isEnabled.refetch();
          }}
        />
      </View>
    );
  }
  if (!permissions.data) {
    return (
      <View className="gap-2">
        {header}
        <Text variant="caption">App blocking needs the Android development build.</Text>
      </View>
    );
  }

  const blockedCount = blocked.data?.length ?? 0;

  return (
    <View className="gap-2">
      {header}
      <Text variant="caption">Pause distracting apps while you&apos;re doing a course.</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Blocked apps, ${blockedCount} selected`}
        onPress={() => router.push('/focus-apps')}
        className="min-h-12 flex-row items-center justify-between rounded-card bg-surface px-4 active:opacity-70"
      >
        <Text variant="body">{`Blocked apps (${blockedCount})`}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
      <View className="min-h-12 flex-row items-center justify-between gap-3 rounded-card bg-surface px-4">
        <View className="flex-1 py-2">
          <Text variant="body">Block apps during courses</Text>
          <Text variant="caption">Also reminds you to come back if you leave mid-course.</Text>
        </View>
        <Switch
          accessibilityLabel="Block apps during courses"
          value={isEnabled.data}
          disabled={setEnabled.isPending}
          onValueChange={(value) => setEnabled.mutate(value)}
        />
      </View>
      {setEnabled.isError ? (
        <Text variant="caption" className="text-primary">
          Couldn&apos;t switch blocking. Please try again.
        </Text>
      ) : null}
    </View>
  );
}
