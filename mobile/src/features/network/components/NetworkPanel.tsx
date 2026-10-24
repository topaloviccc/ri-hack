import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ChallengeCard } from '@/features/network/components/ChallengeCard';
import { FeedCard } from '@/features/network/components/FeedCard';
import { Leaderboard } from '@/features/network/components/Leaderboard';
import { FriendStrip, SuggestedFriends } from '@/features/users';

const MODES = [
  { value: 'network', label: 'Network' },
  { value: 'leaderboards', label: 'Leaderboards' },
] as const;

type Mode = (typeof MODES)[number]['value'];

export function NetworkPanel() {
  const [mode, setMode] = useState<Mode>('network');
  return (
    <View className="flex-1 gap-3">
      <SegmentedControl options={MODES} value={mode} onChange={setMode} className="mx-4" />
      {mode === 'leaderboards' ? (
        <Leaderboard />
      ) : (
        <ScrollView contentContainerClassName="gap-6 pb-8">
          <FriendStrip />
          <FeedCard />
          <ChallengeCard />
          <SuggestedFriends />
        </ScrollView>
      )}
    </View>
  );
}
