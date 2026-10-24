import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, Stack } from 'expo-router';
import { Pressable } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { ProfileView, useMeQuery } from '@/features/users';
import { useThemeColors } from '@/lib/theme';

function SettingsButton() {
  const colors = useThemeColors();
  return (
    <Link href="/settings" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Settings"
        className="h-11 w-11 items-center justify-center active:opacity-70"
      >
        <Ionicons name="settings-outline" size={22} color={colors.primary} />
      </Pressable>
    </Link>
  );
}

export default function ProfileScreen() {
  const { data: me, isPending, isError, refetch } = useMeQuery();
  return (
    <Screen edgeToEdge>
      <Stack.Screen options={{ headerRight: () => <SettingsButton /> }} />
      {isPending ? <LoadingState /> : null}
      {isError ? <ErrorState message="Couldn't load your profile." onRetry={refetch} /> : null}
      {me ? <ProfileView userId={me.id} /> : null}
    </Screen>
  );
}
