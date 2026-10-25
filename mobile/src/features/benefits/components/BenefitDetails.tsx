import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { offerQueryOptions } from '@/features/benefits/api/benefits.queries';
import { OfferInformation } from '@/features/benefits/components/OfferInformation';
import { unavailableReason } from '@/features/benefits/labels';

export function BenefitDetails({ offerId }: { offerId: string }) {
  const offer = useQuery(offerQueryOptions(offerId));
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
  return (
    <ScrollView contentContainerClassName="gap-4 p-4">
      <OfferInformation offer={offer.data} />
      {!available ? (
        <Text variant="caption" className="text-primary" accessibilityLiveRegion="polite">
          {unavailableReason(offer.data)}
        </Text>
      ) : null}
      <Button
        label={`Redeem for ${offer.data.priceCoins} coins`}
        disabled={!available}
        className="self-stretch"
        onPress={() =>
          router.push({ pathname: '/benefits/offer/[id]/confirm', params: { id: offerId } })
        }
      />
    </ScrollView>
  );
}
