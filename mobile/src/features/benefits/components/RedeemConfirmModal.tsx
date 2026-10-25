import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useActivateCoupon } from '@/features/benefits/api/benefits.mutations';
import { offerQueryOptions } from '@/features/benefits/api/benefits.queries';
import { OfferInformation } from '@/features/benefits/components/OfferInformation';

export function RedeemConfirmModal({ offerId }: { offerId: string }) {
  const offer = useQuery(offerQueryOptions(offerId));
  const activate = useActivateCoupon();
  if (offer.isPending) return <LoadingState />;
  if (offer.isError) return <ErrorState message={offer.error.message} onRetry={() => { void offer.refetch(); }} />;
  const available = offer.data.eligible && offer.data.availability === 'AVAILABLE';

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="grow justify-center p-5">
      <Stack.Screen options={{ gestureEnabled: !activate.isPending, headerBackVisible: !activate.isPending }} />
      <View className="w-full max-w-lg gap-5 self-center rounded-3xl bg-surface p-5">
        <Text variant="heading" className="text-center" accessibilityRole="header">Activate this coupon?</Text>
        <OfferInformation offer={offer.data} compact />
        <Text className="text-center">{offer.data.priceCoins} coins will be used now.</Text>
        {!available ? <Text accessibilityLiveRegion="polite">{offer.data.reasonIfIneligible ?? offer.data.availability.replace(/_/g, ' ')}</Text> : null}
        {activate.isError ? (
          <Text accessibilityLiveRegion="polite">{activate.error.message} Activation could not be confirmed. Check My Coupons to see whether the coupon was created.</Text>
        ) : null}
        <Button
          label={activate.isPending ? 'Activating…' : `Activate for ${offer.data.priceCoins} coins`}
          disabled={!available || activate.isPending || activate.isError}
          accessibilityState={{ disabled: !available || activate.isPending || activate.isError, busy: activate.isPending }}
          className="self-stretch disabled:opacity-50"
          onPress={() => activate.mutate({ offerId }, {
            onSuccess: ({ coupon }) => router.replace({ pathname: '/benefits/coupons/[id]', params: { id: coupon.id } }),
          })}
        />
        <Button label={activate.isError ? 'Check My Coupons' : 'Cancel'} className="self-stretch" variant="soft"
          disabled={activate.isPending} onPress={() => activate.isError ? router.replace('/benefits/coupons') : router.back()} />
      </View>
    </ScrollView>
  );
}
