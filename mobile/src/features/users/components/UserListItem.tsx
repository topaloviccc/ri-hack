import { memo, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export type UserListItemProps = {
  id: string;
  name: string;
  avatarUrl: string;
  subtitle?: string;
  /** Left of the avatar, e.g. a leaderboard rank. */
  leading?: ReactNode;
  /** Right side, e.g. an Add button or a score. */
  trailing?: ReactNode;
  isHighlighted?: boolean;
  onPress: (id: string) => void;
};

/** Person row used by People search and the Leaderboard. */
export const UserListItem = memo(function UserListItem({
  id,
  name,
  avatarUrl,
  subtitle,
  leading,
  trailing,
  isHighlighted = false,
  onPress,
}: UserListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${name}'s profile`}
      onPress={() => onPress(id)}
      className={cn(
        'flex-row items-center gap-3 rounded-card border border-border bg-surface p-3 active:opacity-80',
        isHighlighted && 'border-primary bg-primary/10',
      )}
    >
      {leading}
      <Avatar uri={avatarUrl} />
      <View className="flex-1">
        <Text variant="label" className="text-base" numberOfLines={1}>
          {name}
        </Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {trailing}
    </Pressable>
  );
});
