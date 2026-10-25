import { Stack } from 'expo-router';

import { useThemeColors } from '@/lib/theme';

export { ErrorBoundary } from 'expo-router';

export default function BenefitsLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Benefits' }} />
      <Stack.Screen name="partners" options={{ title: 'All partners' }} />
      <Stack.Screen name="offer/[id]/index" options={{ title: 'Offer details' }} />
      <Stack.Screen
        name="offer/[id]/confirm"
        options={{ title: 'Redeem coupon', presentation: 'modal' }}
      />
      <Stack.Screen name="coupons/index" options={{ title: 'My Coupons' }} />
      <Stack.Screen name="coupons/[id]" options={{ title: 'Coupon' }} />
    </Stack>
  );
}
