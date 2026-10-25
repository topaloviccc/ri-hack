import { ScrollView } from 'react-native';

import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { BenefitsEntry } from '@/features/benefits';
import { CourseRow, HOME_SECTIONS } from '@/features/courses';
import { ProfileButton } from '@/features/users';
import { CoinBalance } from '@/features/wallet';

export default function HomeScreen() {
  return (
    <Screen>
      <Header
        title="Home"
        right={
          <>
            <BenefitsEntry />
            <CoinBalance />
            <ProfileButton />
          </>
        }
      />
      <ScrollView contentContainerClassName="gap-8 pb-8 pt-2">
        {HOME_SECTIONS.map((section) => (
          <CourseRow key={section} section={section} />
        ))}
      </ScrollView>
    </Screen>
  );
}
