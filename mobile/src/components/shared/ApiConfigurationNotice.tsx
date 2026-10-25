import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { env } from '@/lib/env';

/** Explain development setup errors before query error states obscure their cause. */
export function ApiConfigurationNotice() {
  if (!__DEV__ || env.apiUrl) return null;

  return (
    <View className="border-b border-primary bg-surface px-4 pb-3 pt-12">
      <Text variant="label">Backend setup required</Text>
      <Text variant="caption">
        Set EXPO_PUBLIC_API_URL in mobile/.env.local, then reload the app. Requests stop before
        reaching the network until it is set.
      </Text>
    </View>
  );
}
