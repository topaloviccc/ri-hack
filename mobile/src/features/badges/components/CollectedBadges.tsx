import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import type { BadgeSummary } from '@/features/badges/api/badges.dto';
import { useUserBadgesQuery } from '@/features/badges/api/badges.queries';

function BadgeTile({ badge }: { badge: BadgeSummary }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Badge: ${badge.name}`}
      onPress={() => router.push({ pathname: '/badge/[id]', params: { id: badge.id } })}
      className="w-24 items-center gap-1 active:opacity-70"
    >
      <Image
        uri={badge.imageUrl}
        className="h-16 w-16 rounded-full border-2 border-primary bg-border"
      />
      <Text variant="caption" numberOfLines={2} className="text-center">
        {badge.name}
      </Text>
    </Pressable>
  );
}

export type CollectedBadgesProps = { userId: string; isOwn: boolean };

/** Profile section of badges earned by scanning NFC tags; hidden on others' empty profiles. */
export function CollectedBadges({ userId, isOwn }: CollectedBadgesProps) {
  const { data, isPending, isError, refetch } = useUserBadgesQuery(userId);
  if (!isOwn && data?.length === 0) return null;

  const renderBody = () => {
    if (isPending) return <LoadingState />;
    if (isError) return <ErrorState onRetry={refetch} />;
    if (data.length === 0)
      return (
        <Text variant="caption">
          Find Out There NFC tags around the city and tap your phone on one to collect a badge.
        </Text>
      );
    return (
      <FlatList
        horizontal
        data={data}
        keyExtractor={(badge) => badge.id}
        renderItem={({ item }) => <BadgeTile badge={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      />
    );
  };

  return (
    <View className="gap-2">
      <Text variant="heading" accessibilityRole="header">
        Collected badges
      </Text>
      {renderBody()}
    </View>
  );
}
