import { View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { DemoNotice } from '@/components/shared/DemoNotice';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { useChallengeQuery } from '@/features/network/api/network.queries';

// TODO(hack): tapping the challenge does nothing yet. See BACKLOG.md.
export function ChallengeCard() {
  const { data, isPending, isError, refetch } = useChallengeQuery();

  const renderBody = () => {
    if (isPending) return <LoadingState />;
    if (isError) return <ErrorState onRetry={refetch} />;
    return (
      <>
        <Text variant="label" className="text-lg">
          {data.title}
        </Text>
        <Text variant="body">{data.reward}</Text>
        <ProgressBar value={data.progress / data.target} />
        <View className="flex-row justify-between">
          <Text variant="mono">
            {data.progress} / {data.target}
          </Text>
          <Text variant="caption">
            {data.daysLeft === 1 ? '1 day left' : `${data.daysLeft} days left`}
          </Text>
        </View>
      </>
    );
  };

  return (
    <View className="gap-2 px-4">
      <Text variant="heading" accessibilityRole="header">
        Weekly challenge
      </Text>
      <DemoNotice>example challenge, progress and reward</DemoNotice>
      <Card className="gap-2 border-primary p-4">{renderBody()}</Card>
    </View>
  );
}
