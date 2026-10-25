import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { FeedCard } from '@/features/network/components/FeedCard';
import { Leaderboard } from '@/features/network/components/Leaderboard';
import { FriendRequests, FriendStrip, SuggestedFriends } from '@/features/users';

const MODES = [
  { value: 'network', label: 'Network' },
  { value: 'leaderboards', label: 'Leaderboard' },
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
          <FriendRequests />
          <FriendStrip />
          <FeedCard />
          <SuggestedFriends />
        </ScrollView>
      )}
    </View>
  );
}
