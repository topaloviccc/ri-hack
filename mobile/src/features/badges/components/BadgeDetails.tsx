import { ScrollView } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { useBadgeQuery } from '@/features/badges/api/badges.queries';
import { BadgeStory } from '@/features/badges/components/BadgeStory';
import { formatDayHeading, toDateKey } from '@/utils/date';
import { pluralize } from '@/utils/format';

export type BadgeDetailsProps = { id: string };

/** The badge page: the full story once collected, otherwise just the teaser. */
export function BadgeDetails({ id }: BadgeDetailsProps) {
  const { data: badge, isPending, isError, refetch } = useBadgeQuery(id);
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState message="Couldn't load this badge." onRetry={refetch} />;

  const earned = badge.awardedCoins > 0 ? ` · earned ${pluralize(badge.awardedCoins, 'coin')}` : '';
  return (
    <ScrollView contentContainerClassName="gap-3 p-4 pb-10">
      {badge.collectedAt ? (
        <Text variant="label">
          {`Collected ${formatDayHeading(toDateKey(new Date(badge.collectedAt)))}${earned}`}
        </Text>
      ) : null}
      <BadgeStory badge={badge} />
    </ScrollView>
  );
}
