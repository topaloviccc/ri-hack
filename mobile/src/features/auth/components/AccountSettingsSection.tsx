import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/components/AuthProvider';

/** Settings › Account: signing out returns to the sign-in screen. */
export function AccountSettingsSection() {
  const { signOut } = useAuth();
  return (
    <View className="gap-2">
      <Text variant="heading" accessibilityRole="header">
        Account
      </Text>
      <Button label="Log out" variant="soft" onPress={signOut} className="self-stretch" />
    </View>
  );
}
