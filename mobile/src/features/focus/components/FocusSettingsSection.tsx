import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useSetFocusActive } from '@/features/focus/api/focus.mutations';
import {
  useBlockedAppsQuery,
  useFocusActiveQuery,
  useFocusPermissionsQuery,
} from '@/features/focus/api/focus.queries';
import { useThemeColors } from '@/lib/theme';

/** Settings › Focus while learning (Android only): blocked apps, plus a temporary course switch. */
export function FocusSettingsSection() {
  const colors = useThemeColors();
  const permissions = useFocusPermissionsQuery();
  const blocked = useBlockedAppsQuery();
  const isActive = useFocusActiveQuery();
  const setActive = useSetFocusActive();

  if (Platform.OS !== 'android') return null;

  const header = (
    <Text variant="heading" accessibilityRole="header">
      Focus while learning
    </Text>
  );
  if (permissions.isPending || isActive.isPending) {
    return (
      <View className="gap-2">
        {header}
        <LoadingState />
      </View>
    );
  }
  if (permissions.isError || isActive.isError) {
    return (
      <View className="gap-2">
        {header}
        <ErrorState
          onRetry={() => {
            permissions.refetch();
            isActive.refetch();
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

  const canBlock = permissions.data.overlay && permissions.data.usageAccess;
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
      {/* TODO(hack): stands in for "a course is in progress" until the course flow (other branch)
          calls focusApi.setActive itself; delete this row then. */}
      <View className="min-h-12 flex-row items-center justify-between gap-3 rounded-card bg-surface px-4">
        <View className="flex-1 py-2">
          <Text variant="body">Simulate course in progress</Text>
          <Text variant="caption">
            {canBlock ? 'Temporary, for testing.' : 'Grant permissions in Blocked apps first.'}
          </Text>
        </View>
        <Switch
          accessibilityLabel="Simulate course in progress"
          value={isActive.data}
          // Turning blocking off must always work, even if a permission was revoked meanwhile.
          disabled={setActive.isPending || (!canBlock && !isActive.data)}
          onValueChange={(value) => setActive.mutate(value)}
        />
      </View>
      {setActive.isError ? (
        <Text variant="caption" className="text-primary">
          Couldn&apos;t switch blocking. Please try again.
        </Text>
      ) : null}
    </View>
  );
}
