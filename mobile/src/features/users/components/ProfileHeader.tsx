import { Alert, ScrollView, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { AddFriendButton } from '@/features/users/components/AddFriendButton';
import type { User } from '@/features/users/types';
import { countryFlag } from '@/utils/flag';

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
        <Text variant="caption">
          @{user.handle} · {countryFlag(user.countryCode)}
        </Text>
        <Text variant="body" className="text-center">
          {user.bio}
        </Text>
        {isOwn ? (
          <Button
            variant="soft"
            label="Edit profile"
            // TODO(hack): edit profile is deferred. See BACKLOG.md.
            onPress={() => Alert.alert('Coming soon', 'Editing your profile is on its way.')}
            className="self-center"
          />
        ) : (
          <AddFriendButton user={user} className="self-center" />
        )}
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
                <Text className="text-2xl">{countryFlag(code)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
