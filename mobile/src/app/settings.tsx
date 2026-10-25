import { Screen } from '@/components/layout/Screen';
import { AccountSettingsSection } from '@/features/auth';
import { ExpertSettingsSection } from '@/features/experts';
import { SettingsPanel } from '@/features/settings';

export default function SettingsScreen() {
  return (
    <Screen edgeToEdge>
      <SettingsPanel>
        <ExpertSettingsSection />
        <AccountSettingsSection />
      </SettingsPanel>
    </Screen>
  );
}
