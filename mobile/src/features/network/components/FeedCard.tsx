import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useFeedQuery } from '@/features/network/api/network.queries';
import { formatTimeAgo } from '@/utils/format';

/** "My feed": friends' most recent course completions. */
export function FeedCard() {
  const { data, isPending, isError, refetch } = useFeedQuery();

  const renderBody = () => {
    if (isPending) return <LoadingState />;
    if (isError) return <ErrorState onRetry={refetch} />;
    if (data.length === 0) return <EmptyState title="Your friends haven't finished anything yet" />;
    // At most 5 items, so a plain column is fine.
    return data.map((item) => (
      <View key={item.id} className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.userName}'s profile`}
          onPress={() => router.push({ pathname: '/user/[id]', params: { id: item.userId } })}
          className="active:opacity-70"
        >
          <Avatar uri={item.userAvatarUrl} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.userName} completed ${item.courseTitle}. Open course`}
          onPress={() => router.push({ pathname: '/course/[id]', params: { id: item.courseId } })}
          className="min-h-11 flex-1 justify-center active:opacity-70"
        >
          <Text variant="body">
            <Text variant="label" className="text-base">
              {item.userName}
            </Text>{' '}
            completed <Text className="font-serif-italic text-lg">{item.courseTitle}</Text>
          </Text>
          <Text variant="caption">{formatTimeAgo(item.completedAt)}</Text>
        </Pressable>
      </View>
    ));
  };

  return (
    <View className="gap-2 px-4">
      <Text variant="heading" accessibilityRole="header">
        My feed
      </Text>
      <Card className="gap-3 p-4">{renderBody()}</Card>
    </View>
  );
}
