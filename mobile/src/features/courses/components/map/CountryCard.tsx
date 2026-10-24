import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useCountryQuery } from '@/features/courses/api/courses.queries';
import { countryFlag } from '@/utils/flag';

export type CountryCardProps = { code: string };

/** Bottom card for the selected country: its course count and a way into the Country page. */
export function CountryCard({ code }: CountryCardProps) {
  const { data, isError, refetch } = useCountryQuery(code);

  const renderBody = () => {
    if (isError) return <Button variant="soft" label="Retry" onPress={() => refetch()} />;
    if (!data) return <Text variant="caption">Loading…</Text>;
    return (
      <>
        <View className="flex-1">
          <Text variant="heading" numberOfLines={1}>
            {countryFlag(code)} {data.name}
          </Text>
          <Text variant="caption">
            {data.courseCount} courses · {data.locationCount} places
          </Text>
        </View>
        <Button
          label="View all"
          onPress={() => router.push({ pathname: '/country/[code]', params: { code } })}
        />
      </>
    );
  };

  return (
    <Card className="absolute bottom-4 left-4 right-4 flex-row items-center gap-3 p-4 shadow-lg shadow-overlay">
      {renderBody()}
    </Card>
  );
}
