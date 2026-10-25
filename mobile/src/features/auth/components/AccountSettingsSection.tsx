import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/components/AuthProvider';
import { confirmDestructive } from '@/utils/confirm';

/** Settings › Account: signing out returns to the sign-in screen. */
export function AccountSettingsSection() {
  const { signOut } = useAuth();
  const handleLogOut = () =>
    confirmDestructive({ title: 'Log out?', confirmLabel: 'Log out', onConfirm: signOut });
  return (
    <View className="gap-2">
      <Text variant="heading" accessibilityRole="header">
        Account
      </Text>
      <Button label="Log out" variant="soft" onPress={handleLogOut} className="self-stretch" />
    </View>
  );
}
