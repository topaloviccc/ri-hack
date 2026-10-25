import { ScrollView, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import { DemoNotice } from '@/components/shared/DemoNotice';
import { AddFriendButton } from '@/features/users/components/AddFriendButton';
import { RemoveFriendButton } from '@/features/users/components/RemoveFriendButton';
import type { User } from '@/features/users/types';
import { CountryFlag } from '@/components/shared/CountryFlag';

// Only the full profile offers unfriending; list rows just show "Friends".
function FriendshipButton({ user }: { user: User }) {
  if (user.relation === 'friend') return <RemoveFriendButton user={user} className="self-center" />;
  return <AddFriendButton user={user} className="self-center" />;
}

export type ProfileHeaderProps = {
  user: User;
  /** Your own coin balance; only passed on your own profile. */
  coins?: number;
};

export function ProfileHeader({ user, coins }: ProfileHeaderProps) {
  const isOwn = user.relation === 'me';
  // Your own profile swaps Countries for Coins; the row stays at three.
  const stats = [
    { label: 'Completed', value: String(user.stats.completedCount) },
    { label: 'Day streak', value: String(user.stats.streakDays) },
    isOwn
      ? { label: 'Coins', value: coins === undefined ? '…' : String(coins) }
      : { label: 'Countries', value: String(user.stats.countriesCount) },
  ];
  return (
    <View className="gap-4">
      <View className="items-center gap-2">
        <Avatar uri={user.avatarUrl} size="lg" />
        <Text variant="title" accessibilityRole="header">
          {user.name}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text variant="caption">@{user.handle}</Text>
          <CountryFlag code={user.countryCode} />
        </View>
        <DemoNotice>bio</DemoNotice>
        <Text variant="body" className="text-center">
          {user.bio}
        </Text>
        {/* TODO(hack): own profile gets an Edit profile button once editing exists. See BACKLOG.md. */}
        {isOwn ? null : <FriendshipButton user={user} />}
      </View>

      <View className="flex-row gap-3">
        {stats.map(({ label, value }) => (
          <View key={label} className="flex-1 items-center rounded-card bg-surface p-3">
            <Text variant="heading" className="text-2xl">
              {value}
            </Text>
            <Text variant="caption">{label}</Text>
          </View>
        ))}
      </View>

      {user.badgeCountryCodes.length > 0 ? (
        <View className="gap-2">
          <Text variant="heading">Country badges</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {user.badgeCountryCodes.map((code) => (
              <View
                key={code}
                accessibilityLabel={`Badge: ${code}`}
                className="h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-surface"
              >
                <CountryFlag code={code} size="md" />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
