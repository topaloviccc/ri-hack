import { Switch as RNSwitch, type SwitchProps as RNSwitchProps } from 'react-native';

import { useThemeColors } from '@/lib/theme';

export type SwitchProps = RNSwitchProps;

/** Platform switch in theme colors. */
export function Switch(props: SwitchProps) {
  const colors = useThemeColors();
  return (
    <RNSwitch
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.surface}
      {...props}
    />
  );
}
