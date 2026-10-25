import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { BenefitArtwork } from '@/features/benefits/components/BenefitArtwork';
import type { Offer } from '@/features/benefits/types';
import { useThemeColors } from '@/lib/theme';

export function OfferInformation({ offer, compact = false }: { offer: Offer; compact?: boolean }) {
  const colors = useThemeColors();
  return (
    <View
      className={
        compact
          ? 'flex-row items-center gap-3 rounded-2xl bg-primary/10 p-3'
          : 'overflow-hidden rounded-3xl bg-surface'
      }
    >
      <BenefitArtwork
        offer={offer}
        className={compact ? 'h-28 w-24 shrink-0 rounded-xl' : 'h-48 w-full'}
      />
      <View className={compact ? 'flex-1 gap-1.5' : 'gap-3 p-5'}>
        <Text variant="caption">{offer.partner.name}</Text>
        <Text variant="heading" accessibilityRole="header">
          {offer.title}
        </Text>
        {offer.subtitle ? <Text variant="caption">{offer.subtitle}</Text> : null}
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="location-outline" size={16} color={colors.muted} />
          <Text variant="caption" className="flex-1">
            {offer.eligibleCountries.map((country) => country.name).join(', ')}
          </Text>
        </View>
        {offer.isDemo || offer.partner.isDemo ? (
          <Text variant="caption" className="text-xs">
            Demo partner offer
          </Text>
        ) : null}
        {!compact && offer.description ? <Text>{offer.description}</Text> : null}
        {!compact ? (
          <>
            <Text variant="label">Participating locations</Text>
            <Text variant="caption">
              {offer.venues.map((venue) => venue.name).join('\n') ||
                'No participating locations available.'}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}
