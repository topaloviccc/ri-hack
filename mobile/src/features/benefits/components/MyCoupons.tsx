import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FlatList, Pressable, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { benefitsKeys, useCouponsQuery } from '@/features/benefits/api/benefits.queries';
import { BenefitArtwork } from '@/features/benefits/components/BenefitArtwork';
import { COUPON_STATUS_LABELS } from '@/features/benefits/labels';
import type { CouponSegment } from '@/features/benefits/types';
import { walletKeys } from '@/features/wallet';
import { formatDateTime } from '@/utils/date';
import { pluralize } from '@/utils/format';

const SEGMENTS: { value: CouponSegment; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'REDEEMED', label: 'Used' },
  { value: 'EXPIRED', label: 'Expired' },
];

export function MyCoupons() {
  const [segment, setSegment] = useState<CouponSegment>('ACTIVE');
  const coupons = useCouponsQuery(segment);
  const client = useQueryClient();
  const { refetch } = coupons;
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );
  useEffect(() => {
    if (!coupons.dataUpdatedAt) return;
    for (const queryKey of [walletKeys.all, benefitsKeys.offerLists(), benefitsKeys.offerDetails()])
      void client.invalidateQueries({ queryKey });
  }, [client, coupons.dataUpdatedAt]);
  return (
    <FlatList
      data={coupons.data?.pages.flatMap((page) => page.items) ?? []}
      contentContainerClassName="grow pb-6"
      keyExtractor={(coupon) => coupon.id}
      ListHeaderComponent={
        <View className="gap-4 p-4">
          <SegmentedControl options={SEGMENTS} value={segment} onChange={setSegment} />
          <Text variant="caption">Your saved coupons and redemption history.</Text>
        </View>
      }
      refreshing={coupons.isRefetching && !coupons.isFetchingNextPage}
      onRefresh={() => {
        void coupons.refetch();
      }}
      onEndReached={() => {
        if (coupons.hasNextPage && !coupons.isFetching) void coupons.fetchNextPage();
      }}
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open coupon ${item.offer.title}, ${COUPON_STATUS_LABELS[item.status]}`}
          className="mx-4 mb-3 gap-2 rounded-card border border-border bg-surface p-4 active:opacity-80"
          onPress={() =>
            router.push({ pathname: '/benefits/coupons/[id]', params: { id: item.id } })
          }
        >
          <View className="flex-row items-center gap-3">
            <BenefitArtwork offer={item.offer} className="h-20 w-20 shrink-0 rounded-lg" />
            <View className="flex-1 gap-1">
              <Text variant="heading">{item.offer.title}</Text>
              <Text variant="caption">{item.offer.partner.name}</Text>
            </View>
          </View>
          {item.offer.isDemo || item.offer.partner.isDemo ? (
            <Text variant="caption">Demo partner offer</Text>
          ) : null}
          <Text variant="label">
            {COUPON_STATUS_LABELS[item.status]} · {pluralize(item.priceCoins, 'coin')} used
          </Text>
          <Text variant="caption">
            Issued {formatDateTime(item.issuedAt)}
            {'\n'}Expires {formatDateTime(item.expiresAt)}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        coupons.isPending ? (
          <LoadingState />
        ) : !coupons.isError ? (
          <View className="items-center justify-center gap-5 px-6 py-16">
            <EmptyState
              className="flex-none"
              title="No coupons here yet"
              message="Choose a little reward for your next adventure."
            />
            <Button
              label="Browse benefits"
              className="self-center"
              onPress={() => router.dismissTo('/benefits')}
            />
          </View>
        ) : undefined
      }
      ListFooterComponent={
        coupons.isError ? (
          <ErrorState
            message={coupons.error.message}
            onRetry={() => {
              void (coupons.isFetchNextPageError ? coupons.fetchNextPage() : coupons.refetch());
            }}
          />
        ) : coupons.isFetchingNextPage ? (
          <LoadingState />
        ) : coupons.hasNextPage ? (
          <Button
            label="Load more"
            className="mx-4 mb-4"
            onPress={() => {
              void coupons.fetchNextPage();
            }}
          />
        ) : undefined
      }
    />
  );
}
