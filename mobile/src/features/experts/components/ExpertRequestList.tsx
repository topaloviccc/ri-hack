import { router } from 'expo-router';
import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { DemoNotice } from '@/components/shared/DemoNotice';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip, type ChipVariant } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { useExpertRequestsQuery } from '@/features/experts/api/experts.queries';
import type { ExpertRequestStatus } from '@/features/experts/types';
import { formatDayHeading, toDateKey } from '@/utils/date';
import { formatBytes } from '@/utils/format';

const STATUS: Record<ExpertRequestStatus, { label: string; variant: ChipVariant }> = {
  pending: { label: 'Pending', variant: 'selected' },
  approved: { label: 'Approved', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'neutral' },
};

const openApply = () => router.push('/expert/apply');

/** The signed-in user's expert requests, newest first. */
export function ExpertRequestList() {
  const { data, isPending, isError, refetch } = useExpertRequestsQuery();

  const renderEmpty = () => {
    if (isPending) return <LoadingState />;
    if (isError) return <ErrorState onRetry={refetch} />;
    return (
      <View className="items-center gap-3 py-10">
        <EmptyState title="No requests yet" message="Apply to become an expert in a field." />
        <Button label="Become an expert" onPress={openApply} />
      </View>
    );
  };

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(r) => r.id}
      contentContainerClassName="gap-3 p-4 pb-10"
      ListHeaderComponent={
        <DemoNotice>example requests and statuses; changes are not sent for review</DemoNotice>
      }
      ListEmptyComponent={renderEmpty}
      renderItem={({ item }) => (
        <Card className="gap-2 p-4">
          <View className="flex-row items-center justify-between gap-2">
            <Text variant="heading" className="flex-1" numberOfLines={1}>
              {item.subject}
            </Text>
            <Chip label={STATUS[item.status].label} variant={STATUS[item.status].variant} />
          </View>
          <Text variant="body">{item.title}</Text>
          <Text variant="caption">
            Submitted {formatDayHeading(toDateKey(new Date(item.submittedAt)))} ·{' '}
            {item.certificate.name} ({formatBytes(item.certificate.sizeBytes)})
          </Text>
          {item.status === 'rejected' ? (
            <Text variant="caption" className="text-text">
              Reason: {item.rejectionReason}
            </Text>
          ) : null}
        </Card>
      )}
    />
  );
}
