import { Screen } from '@/components/layout/Screen';
import { BlockedAppsPanel } from '@/features/focus';

export default function BlockedAppsScreen() {
  return (
    <Screen edgeToEdge>
      <BlockedAppsPanel />
    </Screen>
  );
}
