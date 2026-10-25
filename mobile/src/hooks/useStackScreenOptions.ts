import { useThemeColors } from '@/lib/theme';

/** Shared native header look for every Stack, so nested stacks match the root one. */
export function useStackScreenOptions() {
  const colors = useThemeColors();
  return {
    headerTintColor: colors.primary,
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle: { fontFamily: 'PlusJakartaSans_700Bold', color: colors.text },
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: { backgroundColor: colors.background },
  } as const;
}
