import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { useMeQuery } from '@/features/users/api/users.queries';
import { cn } from '@/lib/cn';

export type ProfileButtonProps = {
  /** Drop shadow for use over photos. */
  elevated?: boolean;
};

export function ProfileButton({ elevated = false }: ProfileButtonProps) {
  const { data: me } = useMeQuery();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      onPress={() => router.push('/profile')}
      className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
    >
      <Avatar uri={me?.avatarUrl} className={cn(elevated && 'shadow-lg shadow-overlay')} />
    </Pressable>
  );
}
