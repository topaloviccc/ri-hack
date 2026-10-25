import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { OptionRow } from '@/components/ui/OptionRow';
import { Text } from '@/components/ui/Text';
import { useCountriesQuery, usePartnersQuery } from '@/features/benefits/api/benefits.queries';
import type { OfferFilters } from '@/features/benefits/types';

// Matches the sheet's p-5 so rows line up with the headings.
const ROW_CLASS = 'px-5';

export type BenefitsFilterSheetProps = {
  filters: OfferFilters;
  onChange: (filters: OfferFilters) => void;
  onClose: () => void;
};

/** Partner and country choices listed inline, so the sheet never opens a second modal. */
export function BenefitsFilterSheet({ filters, onChange, onClose }: BenefitsFilterSheetProps) {
  const partners = usePartnersQuery(filters.countryCode);
  const countries = useCountriesQuery(filters.partnerId);
  const insets = useSafeAreaInsets();
  const isPending = partners.isPending || countries.isPending;
  const isError = partners.isError || countries.isError;
  const sortedCountries = [...(countries.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  const renderOptions = () => {
    if (isPending) return <LoadingState />;
    if (isError) {
      return (
        <ErrorState
          message="Could not load filters."
          onRetry={() => {
            void partners.refetch();
            void countries.refetch();
          }}
        />
      );
    }
    return (
      <>
        <Text variant="label" className="px-5 pt-2">
          Partner
        </Text>
        <View accessibilityRole="radiogroup">
          <OptionRow
            label="All partners"
            isSelected={!filters.partnerId}
            onPress={() => onChange({ ...filters, partnerId: undefined })}
            className={ROW_CLASS}
          />
          {(partners.data ?? []).map((p) => (
            <OptionRow
              key={p.id}
              label={p.isDemo ? `${p.name} (Demo)` : p.name}
              isSelected={filters.partnerId === p.id}
              onPress={() => onChange({ ...filters, partnerId: p.id })}
              className={ROW_CLASS}
            />
          ))}
        </View>
        <Text variant="label" className="px-5 pt-2">
          Country
        </Text>
        <View accessibilityRole="radiogroup">
          <OptionRow
            label="All countries"
            isSelected={!filters.countryCode}
            onPress={() => onChange({ ...filters, countryCode: undefined })}
            className={ROW_CLASS}
          />
          {sortedCountries.map((c) => (
            <OptionRow
              key={c.code}
              label={c.name}
              isSelected={filters.countryCode === c.code}
              onPress={() => onChange({ ...filters, countryCode: c.code })}
              className={ROW_CLASS}
            />
          ))}
        </View>
      </>
    );
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-overlay/40" accessibilityViewIsModal>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close filters"
          onPress={onClose}
          className="flex-1"
        />
        <View
          className="max-h-[85%] rounded-t-card bg-surface pt-5"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          <ScrollView contentContainerClassName="gap-2">
            <View className="gap-1 px-5">
              <Text variant="heading" accessibilityRole="header">
                Filter benefits
              </Text>
              <Text variant="caption">
                Filters apply immediately. Countries reflect participating venues.
              </Text>
            </View>
            {renderOptions()}
            <View className="gap-3 px-5 pt-3">
              <Button
                label="Clear all"
                variant="soft"
                onPress={() => onChange({ sort: filters.sort })}
                className="self-stretch"
              />
              <Button label="Done" className="self-stretch" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
