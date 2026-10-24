import { Screen } from '@/components/layout/Screen';
import { ExpertSettingsSection } from '@/features/experts';
import { SettingsPanel } from '@/features/settings';

export default function SettingsScreen() {
  return (
    <Screen edgeToEdge>
      <SettingsPanel>
        <ExpertSettingsSection />
      </SettingsPanel>
    </Screen>
  );
}
