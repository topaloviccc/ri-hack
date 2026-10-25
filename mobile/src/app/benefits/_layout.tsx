import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/useStackScreenOptions';

export { ErrorBoundary } from 'expo-router';

export default function BenefitsLayout() {
  return (
    <Stack screenOptions={useStackScreenOptions()}>
      <Stack.Screen name="index" options={{ title: 'Benefits' }} />
      <Stack.Screen name="partners" options={{ title: 'All partners' }} />
      <Stack.Screen name="offer/[id]/index" options={{ title: 'Offer details' }} />
      <Stack.Screen
        name="offer/[id]/confirm"
        options={{ title: 'Redeem coupon', presentation: 'modal' }}
      />
      <Stack.Screen name="coupons/index" options={{ title: 'My coupons' }} />
      <Stack.Screen name="coupons/[id]" options={{ title: 'Coupon' }} />
    </Stack>
  );
}
