import { router, Stack } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { usePartnersQuery } from '@/features/benefits/api/benefits.queries';
import { PartnerAvatar } from '@/features/benefits/components/BenefitArtwork';

export function AllPartners() {
  const partners = usePartnersQuery();
  return (
    <>
      <Stack.Screen options={{ title: 'All partners' }} />
      <FlatList
        data={partners.data ?? []}
        contentContainerClassName="grow gap-3 p-4"
        keyExtractor={(partner) => partner.id}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Browse benefits from ${item.name}`}
            className="flex-row items-center gap-3 rounded-card border border-border bg-surface p-4 active:opacity-80"
            onPress={() => router.replace({ pathname: '/benefits', params: { partnerId: item.id } })}
          >
            <PartnerAvatar partner={item} />
            <View className="flex-1 gap-1">
              <Text variant="label">{item.name}</Text>
              {item.isDemo ? <Text variant="caption">Demo partner</Text> : null}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={partners.isPending ? <LoadingState /> : partners.isError ? (
          <ErrorState message={partners.error.message} onRetry={() => { void partners.refetch(); }} />
        ) : <EmptyState title="No partners yet" message="Partner benefits will appear here." />}
      />
    </>
  );
}
