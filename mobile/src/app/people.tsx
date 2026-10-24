import { Screen } from '@/components/layout/Screen';
import { PeopleSearch } from '@/features/users';

export default function PeopleScreen() {
  return (
    <Screen edgeToEdge>
      <PeopleSearch />
    </Screen>
  );
}
