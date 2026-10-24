import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { useThemeColors } from '@/lib/theme';

// 8-digit hex alpha suffixes: transparent -> 80% black.
const ALPHA_STOPS = ['00', 'cc'] as const;

/** Bottom-heavy dark gradient so white text stays readable on any photo. */
export function Scrim() {
  const { overlay } = useThemeColors();
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[`${overlay}${ALPHA_STOPS[0]}`, `${overlay}${ALPHA_STOPS[1]}`]}
      locations={[0.35, 1]}
      style={StyleSheet.absoluteFill}
    />
  );
}
