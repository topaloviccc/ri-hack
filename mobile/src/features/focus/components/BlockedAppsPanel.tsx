import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { focusApi } from '@/features/focus/api/focus.api';
import { useRequestNotifications, useToggleBlockedApp } from '@/features/focus/api/focus.mutations';
import {
  useBlockedAppsQuery,
  useFocusPermissionsQuery,
  useInstalledAppsQuery,
} from '@/features/focus/api/focus.queries';
import { BlockableAppRow } from '@/features/focus/components/BlockableAppRow';
import { PermissionsCard } from '@/features/focus/components/PermissionsCard';

/** Settings › Blocked apps: grant permissions and pick which apps pause during a course. */
export function BlockedAppsPanel() {
  const permissions = useFocusPermissionsQuery();
  const apps = useInstalledAppsQuery();
  const blocked = useBlockedAppsQuery();
  const toggle = useToggleBlockedApp();
  const requestNotifications = useRequestNotifications();
  const [search, setSearch] = useState('');

  const { mutate: toggleApp } = toggle;
  const handleToggle = useCallback(
    (packageName: string, isBlocked: boolean) => toggleApp({ packageName, isBlocked }),
    [toggleApp],
  );

  if (permissions.isPending) return <LoadingState />;
  if (permissions.isError) return <ErrorState onRetry={permissions.refetch} />;
  if (!permissions.data) {
    return (
      <EmptyState
        title="Not available here"
        message="App blocking needs the Android development build."
      />
    );
  }
  if (apps.isPending || blocked.isPending) return <LoadingState />;
  if (apps.isError) return <ErrorState onRetry={apps.refetch} />;
  if (blocked.isError) return <ErrorState onRetry={blocked.refetch} />;

  const blockedSet = new Set(blocked.data);
  const query = search.trim().toLowerCase();
  const visibleApps = query
    ? apps.data.filter(
        (app) =>
          app.name.toLowerCase().includes(query) || app.packageName.toLowerCase().includes(query),
      )
    : apps.data;

  return (
    <FlatList
      data={visibleApps}
      keyExtractor={(app) => app.packageName}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerClassName="pb-8"
      ListHeaderComponent={
        <View className="gap-3 p-4">
          <PermissionsCard
            permissions={permissions.data}
            onOpenOverlay={focusApi.openOverlaySettings}
            onOpenUsageAccess={focusApi.openUsageAccessSettings}
            onRequestNotifications={() => requestNotifications.mutate()}
          />
          <Text variant="caption">
            These apps are paused while you&apos;re doing a course. {blockedSet.size} selected.
          </Text>
          {toggle.isError ? (
            <Text variant="caption" className="text-primary">
              Couldn&apos;t save that change. Please try again.
            </Text>
          ) : null}
          <TextField
            value={search}
            onChangeText={setSearch}
            placeholder="Search apps"
            accessibilityLabel="Search apps"
            autoCorrect={false}
          />
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title={query ? 'No matching apps' : 'No apps found'}
          message={query ? 'Try a different name.' : undefined}
        />
      }
      renderItem={({ item }) => (
        <BlockableAppRow
          app={item}
          isBlocked={blockedSet.has(item.packageName)}
          onToggle={handleToggle}
        />
      )}
    />
  );
}
