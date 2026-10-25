import { router } from 'expo-router';
import { View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { Text } from '@/components/ui/Text';
import { useUsersQuery } from '@/features/users/api/users.queries';
import { FriendRequestActions } from '@/features/users/components/FriendRequestActions';
import { UserListItem } from '@/features/users/components/UserListItem';

const openProfile = (id: string) => router.push({ pathname: '/user/[id]', params: { id } });

/** Requests the signed-in user received; hidden while loading and when there are none. */
export function FriendRequests() {
  const { data, isError, refetch } = useUsersQuery({ relation: 'incoming' });

  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data || data.length === 0) return null;

  return (
    <View className="gap-2 px-4">
      <Text variant="heading" accessibilityRole="header">
        Friend requests
      </Text>
      {/* At most a handful of pending requests, so a plain map is fine here. */}
      {data.map((user) => (
        <UserListItem
          key={user.id}
          id={user.id}
          name={user.name}
          avatarUrl={user.avatarUrl}
          subtitle={`@${user.handle}`}
          onPress={openProfile}
          trailing={<FriendRequestActions user={user} />}
        />
      ))}
    </View>
  );
}
