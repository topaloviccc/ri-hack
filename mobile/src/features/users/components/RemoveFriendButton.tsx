import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useUpdateFriendship } from '@/features/users/api/users.mutations';
import type { User } from '@/features/users/types';

export type RemoveFriendButtonProps = {
  user: Pick<User, 'id' | 'name'>;
  className?: string;
};

/** Two taps to unfriend: the first asks for confirmation (works the same on web, unlike Alert). */
export function RemoveFriendButton({ user, className }: RemoveFriendButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { mutate, isPending, isError } = useUpdateFriendship();

  let label = 'Friends · Remove';
  if (isPending) label = 'Removing…';
  else if (isError) label = 'Retry removing';
  else if (isConfirming) label = `Tap again to remove ${user.name.split(' ')[0]}`;

  const handlePress = () => {
    if (!isConfirming && !isError) {
      setIsConfirming(true);
      return;
    }
    mutate({ id: user.id, action: 'unfriend' });
  };

  return (
    <Button
      variant={isConfirming ? 'primary' : 'soft'}
      label={label}
      accessibilityLabel={
        isConfirming
          ? `Confirm removing ${user.name} as a friend`
          : `Remove ${user.name} as a friend`
      }
      accessibilityState={{ busy: isPending }}
      disabled={isPending}
      onPress={handlePress}
      className={className}
    />
  );
}
