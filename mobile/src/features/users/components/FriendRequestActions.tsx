import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useUpdateFriendship } from '@/features/users/api/users.mutations';
import type { User } from '@/features/users/types';
import { cn } from '@/lib/cn';

export type FriendRequestActionsProps = {
  user: Pick<User, 'id' | 'name'>;
  className?: string;
};

/** Accept / Decline for a request the signed-in user received. */
export function FriendRequestActions({ user, className }: FriendRequestActionsProps) {
  const { mutate, isPending, isError, variables } = useUpdateFriendship();
  const pendingAction = isPending ? variables?.action : undefined;
  let acceptLabel = 'Accept';
  if (pendingAction === 'accept') acceptLabel = 'Accepting…';
  else if (isError) acceptLabel = 'Retry';

  return (
    <View className={cn('flex-row gap-2', className)}>
      <Button
        label={acceptLabel}
        accessibilityLabel={`Accept ${user.name}'s friend request`}
        accessibilityState={{ busy: pendingAction === 'accept', disabled: isPending }}
        disabled={isPending}
        onPress={() => mutate({ id: user.id, action: 'accept' })}
      />
      <Button
        variant="soft"
        label={pendingAction === 'decline' ? 'Declining…' : 'Decline'}
        accessibilityLabel={`Decline ${user.name}'s friend request`}
        accessibilityState={{ busy: pendingAction === 'decline', disabled: isPending }}
        disabled={isPending}
        onPress={() => mutate({ id: user.id, action: 'decline' })}
      />
    </View>
  );
}
