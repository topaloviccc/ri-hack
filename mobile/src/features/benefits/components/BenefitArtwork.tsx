import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Image } from '@/components/ui/Image';
import type { Offer, Partner } from '@/features/benefits/types';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';

const PARTNER_ICONS = {
  'b1000000-0000-4000-8000-000000000001': 'restaurant',
  'b1000000-0000-4000-8000-000000000002': 'gift',
  'b1000000-0000-4000-8000-000000000003': 'library',
  'b1000000-0000-4000-8000-000000000004': 'cafe',
  'b1000000-0000-4000-8000-000000000005': 'mail',
  'b1000000-0000-4000-8000-000000000006': 'ice-cream',
} as const;

export function PartnerAvatar({ partner }: { partner: Partner }) {
  const colors = useThemeColors();
  const icon = PARTNER_ICONS[partner.id as keyof typeof PARTNER_ICONS] ?? 'gift';
  return (
    <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-secondary/30 bg-secondary/20">
      {partner.logoUrl ? (
        <Image uri={partner.logoUrl} className="h-full w-full" />
      ) : (
        <Ionicons name={icon} size={28} color={colors.onSecondary} />
      )}
    </View>
  );
}

export function BenefitArtwork({ offer, className }: { offer: Offer; className?: string }) {
  const colors = useThemeColors();
  return (
    <View className={cn('items-center justify-center overflow-hidden bg-secondary/20', className)}>
      {offer.imageUrl ? (
        <Image uri={offer.imageUrl} accessibilityLabel={offer.title} className="h-full w-full" />
      ) : (
        <Ionicons name="gift-outline" size={32} color={colors.secondary} />
      )}
    </View>
  );
}
