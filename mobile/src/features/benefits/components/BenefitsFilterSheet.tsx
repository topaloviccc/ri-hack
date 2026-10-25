import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useCountriesQuery, usePartnersQuery } from '@/features/benefits/api/benefits.queries';
import type { OfferFilters } from '@/features/benefits/types';

export type BenefitsFilterSheetProps = {
  filters: OfferFilters; onChange: (filters: OfferFilters) => void; onClose: () => void;
};

export function BenefitsFilterSheet({ filters, onChange, onClose }: BenefitsFilterSheetProps) {
  const partners = usePartnersQuery(filters.countryCode);
  const countries = useCountriesQuery(filters.partnerId);
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-overlay/40" accessibilityViewIsModal>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="max-h-[85%] rounded-t-card bg-surface p-5" style={{ paddingBottom: insets.bottom + 20 }}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4">
            <Text variant="heading" accessibilityRole="header">Filter benefits</Text>
            <Text variant="caption">Filters apply immediately. Countries reflect participating venues.</Text>
            {partners.isPending || countries.isPending ? <LoadingState /> : null}
            {partners.isError || countries.isError ? (
              <ErrorState message="Could not load filters." onRetry={() => { void partners.refetch(); void countries.refetch(); }} />
            ) : null}
            <Select label="Partner" placeholder="All partners" value={filters.partnerId ?? ''}
              options={[{ value: '', label: 'All partners' }, ...(partners.data ?? []).map((p) => ({ value: p.id, label: p.isDemo ? `${p.name} (Demo)` : p.name }))]}
              onChange={(partnerId) => onChange({ ...filters, partnerId: partnerId || undefined })} />
            <TextField accessibilityLabel="Search countries" placeholder="Search countries" value={search} onChangeText={setSearch} />
            <Select label="Country" placeholder="All countries" value={filters.countryCode ?? ''}
              options={[{ value: '', label: 'All countries' }, ...(countries.data ?? [])
                .filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()) || c.code === filters.countryCode)
                .sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ value: c.code, label: c.name }))]}
              onChange={(countryCode) => onChange({ ...filters, countryCode: countryCode || undefined })} />
            <Button label="Clear all" variant="soft" onPress={() => { onChange({ sort: 'POPULAR' }); setSearch(''); }} />
            <Button label="Done" className="self-stretch" onPress={onClose} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
