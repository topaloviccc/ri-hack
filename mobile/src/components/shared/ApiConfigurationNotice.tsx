import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { env } from '@/lib/env';

/** Explain development setup errors before query error states obscure their cause. */
export function ApiConfigurationNotice() {
  if (!__DEV__) return null;
  const missing = [
    !env.apiUrl && 'EXPO_PUBLIC_API_URL',
    !env.userId && 'EXPO_PUBLIC_USER_ID',
  ].filter(Boolean);
  if (missing.length === 0) return null;

  return (
    <View className="border-b border-primary bg-surface px-4 pb-3 pt-12">
      <Text variant="label">Backend setup required</Text>
      <Text variant="caption">
        Set {missing.join(' and ')} in mobile/.env.local, then reload the app. Requests requiring
        these values stop before reaching the network.
      </Text>
    </View>
  );
}
