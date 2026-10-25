import { router } from 'expo-router';
import { FlatList } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { useLeaderboardQuery } from '@/features/network/api/network.queries';
import { UserListItem } from '@/features/users';
import { pluralize } from '@/utils/format';

const openProfile = (id: string) => router.push({ pathname: '/user/[id]', params: { id } });

// TODO(hack): friends-only weekly board; a global leaderboard is deferred. See BACKLOG.md.
export function Leaderboard() {
  const { data, isPending, isError, refetch } = useLeaderboardQuery();

  const renderEmpty = () => {
    if (isPending) return <LoadingState />;
    if (isError) return <ErrorState onRetry={refetch} />;
    return <EmptyState title="No one on the board yet" />;
  };

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(e) => e.userId}
      contentContainerClassName="gap-3 px-4 pb-8"
      ListHeaderComponent={<Text variant="caption">This week · courses completed</Text>}
      ListEmptyComponent={renderEmpty}
      renderItem={({ item }) => (
        <UserListItem
          id={item.userId}
          name={item.isMe ? `${item.userName} (you)` : item.userName}
          avatarUrl={item.userAvatarUrl}
          isHighlighted={item.isMe}
          onPress={openProfile}
          leading={
            <Text variant="mono" className="w-6 text-center text-base text-text">
              {item.rank}
            </Text>
          }
          trailing={
            <Text
              variant="heading"
              accessibilityLabel={pluralize(item.completedThisWeek, 'course')}
            >
              {item.completedThisWeek}
            </Text>
          }
        />
      )}
    />
  );
}
