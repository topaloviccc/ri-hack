import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { CoinIcon } from '@/components/ui/CoinIcon';
import { Text } from '@/components/ui/Text';
import { BenefitArtwork } from '@/features/benefits/components/BenefitArtwork';
import { availabilityLabel, unavailableReason } from '@/features/benefits/labels';
import type { Offer } from '@/features/benefits/types';
import { useThemeColors } from '@/lib/theme';
import { pluralize } from '@/utils/format';

export type BenefitCouponCardProps = {
  offer: Offer;
  availableBalance?: number;
  onPress: () => void;
  onPressIn?: () => void;
};

export function BenefitCouponCard({
  offer,
  availableBalance,
  onPress,
  onPressIn,
}: BenefitCouponCardProps) {
  const colors = useThemeColors();
  const scope = offer.eligibleCountries.map((country) => country.name).join(', ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View offer ${offer.title}, ${offer.partner.name}, ${scope}, ${pluralize(offer.priceCoins, 'coin')}, ${availabilityLabel(offer.availability)}`}
      accessibilityHint="Opens offer details"
      onPress={onPress}
      onPressIn={onPressIn}
      className="mx-4 mb-3 flex-row items-center gap-3 rounded-card border border-primary/20 bg-primary/10 p-3 active:opacity-80"
    >
      <BenefitArtwork offer={offer} className="h-28 w-20 shrink-0 rounded-lg" />
      <View className="flex-1 gap-1.5">
        <Text variant="label" className="text-base" numberOfLines={2}>
          {offer.title}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {offer.partner.name}
        </Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="location-outline" size={16} color={colors.muted} />
          <Text variant="caption" className="flex-1" numberOfLines={1}>
            {scope}
          </Text>
        </View>
        {offer.isDemo || offer.partner.isDemo ? (
          <Text variant="caption" className="text-xs">
            Demo offer
          </Text>
        ) : null}
        {!offer.eligible || offer.availability !== 'AVAILABLE' ? (
          <Text variant="caption">{unavailableReason(offer)}</Text>
        ) : null}
        {availableBalance !== undefined && availableBalance < offer.priceCoins ? (
          <Text variant="caption">
            Need {pluralize(offer.priceCoins - availableBalance, 'more coin', 'more coins')}
          </Text>
        ) : null}
      </View>
      <View className="items-center gap-1 rounded-xl bg-primary/25 px-2.5 py-3">
        <CoinIcon />
        <Text variant="label">{offer.priceCoins}</Text>
        <Text variant="caption" className="text-xs text-text">
          coins
        </Text>
      </View>
    </Pressable>
  );
}
