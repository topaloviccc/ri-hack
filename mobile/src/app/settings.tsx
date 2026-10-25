import { router } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { AccountSettingsSection } from '@/features/auth';
import { ExpertSettingsSection } from '@/features/experts';
import { FocusSettingsSection } from '@/features/focus';
import { SettingsPanel } from '@/features/settings';

export default function SettingsScreen() {
  return (
    <Screen edgeToEdge>
      <SettingsPanel>
        <Button
          label="Learning interests"
          variant="soft"
          onPress={() => router.push('/interests')}
          className="self-stretch"
        />
        <ExpertSettingsSection />
        <FocusSettingsSection />
        <AccountSettingsSection />
      </SettingsPanel>
    </Screen>
  );
}
