import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { couponQueryOptions } from '@/features/benefits/api/benefits.queries';
import { useMarkCouponUsed } from '@/features/benefits/api/benefits.mutations';
import { BenefitArtwork, PartnerAvatar } from '@/features/benefits/components/BenefitArtwork';
import { RedemptionCode } from '@/features/benefits/components/RedemptionCode';

export function ActiveCoupon({ couponId }: { couponId: string }) {
  const coupon = useQuery(couponQueryOptions(couponId));
  const markUsed = useMarkCouponUsed();
  if (coupon.isPending) return <LoadingState />;
  if (!coupon.data)
    return <ErrorState message={coupon.error?.message} onRetry={() => { void coupon.refetch(); }} />;

  const data = coupon.data;
  return (
    <ScrollView contentContainerClassName="gap-4 p-4">
      <Stack.Screen options={{ title: data.status === 'ACTIVE' ? 'Active coupon' : 'Coupon' }} />
      <View className="overflow-hidden rounded-card border border-border bg-surface">
        <BenefitArtwork offer={data.offer} className="h-44 w-full" />
        <View className="items-center gap-4 px-5 pb-6">
          <View className="-mt-8 rounded-full border-4 border-surface">
            <PartnerAvatar partner={data.offer.partner} />
          </View>
          <View className="items-center gap-1">
            <Text variant="label" className="text-center">{data.offer.partner.name}</Text>
            <Text variant="title" className="text-center text-2xl" accessibilityRole="header">
              {data.offer.title}
            </Text>
            {data.offer.subtitle ? <Text variant="caption" className="text-center">{data.offer.subtitle}</Text> : null}
          </View>
          {data.status === 'ACTIVE' ? (
            <RedemptionCode code={data.redemptionCode} />
          ) : data.status === 'REDEEMED' ? (
            <Text>This coupon was already used.</Text>
          ) : (
            <Text>This coupon has expired.</Text>
          )}
          <Text variant="caption" className="text-center">{data.priceCoins} coins used</Text>
          {data.status === 'ACTIVE' ? (
            <View className="w-full items-center gap-2">
              {markUsed.isError ? <Text variant="caption" className="text-primary" accessibilityLiveRegion="polite">{markUsed.error.message}</Text> : null}
              <Button
                label={markUsed.isPending ? 'Updating...' : 'Mark as used'}
                className="self-center"
                disabled={markUsed.isPending}
                accessibilityState={{ busy: markUsed.isPending }}
                onPress={() => markUsed.mutate({ couponId }, {
                  onSuccess: () => { void coupon.refetch(); },
                })}
              />
            </View>
          ) : null}
          <View className="w-full flex-row items-start gap-2 border-t border-border pt-4">
            <Text variant="caption" className="flex-1">
              {data.offer.venues.map((venue) => venue.name).join('\n')}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
