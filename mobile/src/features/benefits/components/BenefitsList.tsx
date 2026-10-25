import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import {
  useCountriesQuery,
  useOffersQuery,
  usePartnersQuery,
} from '@/features/benefits/api/benefits.queries';
import { BenefitCouponCard } from '@/features/benefits/components/BenefitCouponCard';
import { PartnerAvatar } from '@/features/benefits/components/BenefitArtwork';
import { BenefitsFilterSheet } from '@/features/benefits/components/BenefitsFilterSheet';
import type { OfferFilters, OfferSort } from '@/features/benefits/types';
import { CoinBalance, useWalletQuery } from '@/features/wallet';
import { useThemeColors } from '@/lib/theme';

const SORTS: { value: OfferSort; label: string }[] = [
  { value: 'POPULAR', label: 'Popular' },
  { value: 'PRICE_ASC', label: 'Price: low to high' },
  { value: 'PRICE_DESC', label: 'Price: high to low' },
  { value: 'NEWEST', label: 'Newest' },
];

export function BenefitsList() {
  const colors = useThemeColors();
  const { partnerId } = useLocalSearchParams<{ partnerId?: string }>();
  const [filters, setFilters] = useState<OfferFilters>({ sort: 'POPULAR', partnerId });
  const [previousPartnerId, setPreviousPartnerId] = useState(partnerId);
  if (partnerId !== previousPartnerId) {
    setPreviousPartnerId(partnerId);
    setFilters((current) => ({ ...current, partnerId: partnerId || undefined }));
  }
  const [showFilters, setShowFilters] = useState(false);
  const offers = useOffersQuery(filters);
  const wallet = useWalletQuery();
  const partners = usePartnersQuery();
  const countries = useCountriesQuery();
  const { refetch } = offers;
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );
  const partner = partners.data?.find((p) => p.id === filters.partnerId);
  const country = countries.data?.find((c) => c.code === filters.countryCode);
  return (
    <>
      <Stack.Screen options={{ headerRight: () => <CoinBalance /> }} />
      <FlatList
        data={offers.data?.pages.flatMap((page) => page.items) ?? []}
        contentContainerClassName="pb-6"
        keyExtractor={(offer) => offer.id}
        keyboardShouldPersistTaps="handled"
        refreshing={offers.isRefetching && !offers.isFetchingNextPage}
        onRefresh={() => {
          void offers.refetch();
          void wallet.refetch();
        }}
        onEndReached={() => {
          if (offers.hasNextPage && !offers.isFetching) void offers.fetchNextPage();
        }}
        ListHeaderComponent={
          <View className="gap-5 py-4">
            <View className="flex-row items-center gap-2 px-4">
              <View className="flex-1">
                <TextField
                  accessibilityLabel="Search benefits"
                  placeholder="Search benefits"
                  value={filters.q ?? ''}
                  onChangeText={(q) => setFilters({ ...filters, q: q || undefined })}
                  returnKeyType="search"
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Filter benefits"
                onPress={() => setShowFilters(true)}
                className="h-12 w-12 items-center justify-center rounded-2xl bg-secondary/20 active:opacity-70"
              >
                <Ionicons name="options-outline" size={24} color={colors.text} />
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-2 px-4">
              <Button
                label={partner?.name ?? 'Partner'}
                variant="soft"
                icon={<Ionicons name="storefront-outline" size={16} color={colors.text} />}
                onPress={() => setShowFilters(true)}
              />
              <Button
                label={country?.name ?? filters.countryCode ?? 'Country'}
                variant="soft"
                icon={<Ionicons name="globe-outline" size={16} color={colors.text} />}
                onPress={() => setShowFilters(true)}
              />
              {filters.partnerId || filters.countryCode || filters.q ? (
                <Button
                  label="Clear"
                  variant="soft"
                  onPress={() => setFilters({ sort: filters.sort })}
                />
              ) : null}
            </View>
            <View className="flex-row items-center justify-between px-4">
              <Text variant="heading">Popular partners</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="See all partners"
                onPress={() => router.push('/benefits/partners')}
                className="min-h-11 justify-center px-2"
              >
                <Text variant="label">See all</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-4 px-4"
            >
              {(partners.data ?? []).map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${item.name}`}
                  accessibilityState={{ selected: filters.partnerId === item.id }}
                  className="w-20 items-center gap-2 active:opacity-70"
                  onPress={() =>
                    setFilters({
                      ...filters,
                      partnerId: filters.partnerId === item.id ? undefined : item.id,
                    })
                  }
                >
                  <View
                    className={
                      filters.partnerId === item.id
                        ? 'rounded-full border-2 border-primary p-0.5'
                        : 'p-0.5'
                    }
                  >
                    <PartnerAvatar partner={item} />
                  </View>
                  <Text variant="caption" className="text-center text-text" numberOfLines={2}>
                    {item.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {partners.isError || countries.isError ? (
              <ErrorState
                message="Could not load filters."
                onRetry={() => {
                  void partners.refetch();
                  void countries.refetch();
                }}
              />
            ) : null}
            {wallet.isError ? (
              <ErrorState
                message={wallet.error.message}
                onRetry={() => {
                  void wallet.refetch();
                }}
              />
            ) : null}
            <View className="flex-row flex-wrap items-center justify-between gap-2 px-4">
              <Text variant="heading">All coupons</Text>
              <View className="w-44">
                <Select
                  label="Sort benefits"
                  placeholder="Popular"
                  options={SORTS}
                  value={filters.sort ?? 'POPULAR'}
                  onChange={(sort) => setFilters({ ...filters, sort })}
                />
              </View>
            </View>
            <Button
              label="My Coupons"
              className="mx-4 self-end"
              variant="soft"
              onPress={() => router.push('/benefits/coupons')}
            />
          </View>
        }
        renderItem={({ item }) => (
          <BenefitCouponCard
            offer={item}
            availableBalance={wallet.data?.availableBalance}
            onPress={() =>
              router.push({ pathname: '/benefits/offer/[id]/confirm', params: { id: item.id } })
            }
          />
        )}
        ListEmptyComponent={
          offers.isPending ? (
            <LoadingState />
          ) : !offers.isError ? (
            <EmptyState
              title="No benefits found"
              message="Try another search, partner or country."
            />
          ) : undefined
        }
        ListFooterComponent={
          offers.isError ? (
            <ErrorState
              message={offers.error.message}
              onRetry={() => {
                void (offers.isFetchNextPageError ? offers.fetchNextPage() : offers.refetch());
              }}
            />
          ) : offers.isFetchingNextPage ? (
            <LoadingState />
          ) : offers.hasNextPage ? (
            <Button
              label="Load more"
              className="mx-4 mb-4"
              onPress={() => {
                void offers.fetchNextPage();
              }}
            />
          ) : undefined
        }
      />
      {showFilters ? (
        <BenefitsFilterSheet
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      ) : null}
    </>
  );
}
