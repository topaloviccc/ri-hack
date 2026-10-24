import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useExpertRequestsQuery } from '@/features/experts/api/experts.queries';

/** Settings › Expert: apply, plus a small link to request status. */
export function ExpertSettingsSection() {
  const { data } = useExpertRequestsQuery();
  const pendingCount = data?.filter((r) => r.status === 'pending').length ?? 0;
  const statusLabel =
    pendingCount > 0 ? `Check request status (${pendingCount} pending)` : 'Check request status';

  return (
    <View className="gap-2">
      <Text variant="heading" accessibilityRole="header">
        Expert
      </Text>
      <Text variant="caption">Ask to be verified as an expert in a field.</Text>
      <Button
        label="Become an expert"
        onPress={() => router.push('/expert/apply')}
        className="self-stretch"
      />
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push('/expert/requests')}
        className="min-h-11 items-center justify-center active:opacity-70"
      >
        <Text variant="label" className="text-primary">
          {statusLabel}
        </Text>
      </Pressable>
    </View>
  );
}
