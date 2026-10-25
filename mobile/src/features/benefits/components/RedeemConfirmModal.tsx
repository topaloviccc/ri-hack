import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { ScrollView } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useActivateCoupon } from '@/features/benefits/api/benefits.mutations';
import { offerQueryOptions } from '@/features/benefits/api/benefits.queries';
import { OfferInformation } from '@/features/benefits/components/OfferInformation';

/** Last step before spending coins; the header ("Redeem coupon") is the question. */
export function RedeemConfirmModal({ offerId }: { offerId: string }) {
  const offer = useQuery(offerQueryOptions(offerId));
  const redeem = useActivateCoupon();
  if (offer.isPending) return <LoadingState />;
  if (offer.isError)
    return (
      <ErrorState
        message={offer.error.message}
        onRetry={() => {
          void offer.refetch();
        }}
      />
    );
  const available = offer.data.eligible && offer.data.availability === 'AVAILABLE';
  const isBlocked = !available || redeem.isPending || redeem.isError;

  return (
    <ScrollView contentContainerClassName="w-full max-w-lg gap-5 self-center p-4">
      <Stack.Screen
        options={{ gestureEnabled: !redeem.isPending, headerBackVisible: !redeem.isPending }}
      />
      <OfferInformation offer={offer.data} compact />
      <Text className="text-center">{offer.data.priceCoins} coins will be used now.</Text>
      {!available ? (
        <Text variant="caption" className="text-primary" accessibilityLiveRegion="polite">
          {offer.data.reasonIfIneligible ?? offer.data.availability.replace(/_/g, ' ')}
        </Text>
      ) : null}
      {redeem.isError ? (
        <Text variant="caption" className="text-primary" accessibilityLiveRegion="polite">
          {redeem.error.message} Redemption could not be confirmed. Check My coupons to see
          whether the coupon was created.
        </Text>
      ) : null}
      <Button
        label={redeem.isPending ? 'Redeeming…' : `Redeem for ${offer.data.priceCoins} coins`}
        disabled={isBlocked}
        accessibilityState={{ disabled: isBlocked, busy: redeem.isPending }}
        className="self-stretch"
        onPress={() =>
          redeem.mutate(
            { offerId },
            {
              onSuccess: ({ coupon }) =>
                router.replace({ pathname: '/benefits/coupons/[id]', params: { id: coupon.id } }),
            },
          )
        }
      />
      <Button
        label={redeem.isError ? 'Check My coupons' : 'Cancel'}
        className="self-stretch"
        variant="soft"
        disabled={redeem.isPending}
        onPress={() => (redeem.isError ? router.replace('/benefits/coupons') : router.back())}
      />
    </ScrollView>
  );
}
