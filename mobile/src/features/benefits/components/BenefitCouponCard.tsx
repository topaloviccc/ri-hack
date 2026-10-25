import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { CoinIcon } from '@/components/ui/CoinIcon';
import { Text } from '@/components/ui/Text';
import { BenefitArtwork } from '@/features/benefits/components/BenefitArtwork';
import type { Offer } from '@/features/benefits/types';
import { useThemeColors } from '@/lib/theme';

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
      accessibilityLabel={`View / Redeem ${offer.title}, ${offer.partner.name}, ${scope}, ${offer.priceCoins} coins, ${offer.availability}`}
      accessibilityHint="Opens redemption confirmation"
      onPress={onPress}
      onPressIn={onPressIn}
      className="relative mx-4 mb-3 flex-row items-center gap-3 rounded-card border border-primary/20 bg-primary/10 p-3 active:opacity-80"
    >
      <BenefitArtwork offer={offer} className="h-28 w-20 shrink-0 rounded-lg" />
      <View className="flex-1 gap-1.5">
        <Text variant="label" className="font-sans-bold text-base" numberOfLines={2}>
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
          <Text variant="caption">
            {offer.reasonIfIneligible ?? offer.availability.replace(/_/g, ' ')}
          </Text>
        ) : null}
        {availableBalance !== undefined && availableBalance < offer.priceCoins ? (
          <Text variant="caption">Need {offer.priceCoins - availableBalance} more coins</Text>
        ) : null}
      </View>
      <View className="items-center gap-1 rounded-xl bg-primary/25 px-2.5 py-3">
        <CoinIcon />
        <Text variant="label" className="font-sans-bold">
          {offer.priceCoins}
        </Text>
        <Text variant="caption" className="text-xs text-text">
          coins
        </Text>
      </View>
      <View
        pointerEvents="none"
        className="absolute -left-2 h-4 w-4 rounded-full bg-background"
        style={{ top: '50%' }}
      />
      <View
        pointerEvents="none"
        className="absolute -right-2 h-4 w-4 rounded-full bg-background"
        style={{ top: '50%' }}
      />
    </Pressable>
  );
}
