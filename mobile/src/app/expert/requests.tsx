import { Screen } from '@/components/layout/Screen';
import { ExpertRequestList } from '@/features/experts';

export default function ExpertRequestsScreen() {
  return (
    <Screen edgeToEdge>
      <ExpertRequestList />
    </Screen>
  );
}
