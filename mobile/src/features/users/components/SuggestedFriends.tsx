import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import { useUsersQuery } from '@/features/users/api/users.queries';
import { AddFriendButton } from '@/features/users/components/AddFriendButton';

const ROW_HEIGHT_CLASS = 'h-48';

const openProfile = (id: string) => router.push({ pathname: '/user/[id]', params: { id } });

/** Up to 10 suggested people as horizontal cards with an Add button. */
export function SuggestedFriends() {
  const { data, isPending, isError, refetch } = useUsersQuery({ suggested: true });

  const renderBody = () => {
    if (isPending) return <LoadingState className={ROW_HEIGHT_CLASS} />;
    if (isError) return <ErrorState onRetry={refetch} className={ROW_HEIGHT_CLASS} />;
    if (data.length === 0) return <EmptyState title="No suggestions right now" />;
    return (
      <FlatList
        horizontal
        data={data}
        keyExtractor={(u) => u.id}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4"
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name}'s profile`}
            onPress={() => openProfile(item.id)}
            className="w-40 items-center gap-2 rounded-card border border-border bg-surface p-3 active:opacity-80"
          >
            <Avatar uri={item.avatarUrl} size="md" />
            <Text variant="label" numberOfLines={1}>
              {item.name}
            </Text>
            <Text variant="caption" numberOfLines={1}>
              {item.mutualFriendsCount} mutual friends
            </Text>
            <AddFriendButton user={item} className="self-center" />
          </Pressable>
        )}
      />
    );
  };

  return (
    <View className="gap-2">
      <Text variant="heading" className="px-4" accessibilityRole="header">
        Suggested friends
      </Text>
      {renderBody()}
    </View>
  );
}
