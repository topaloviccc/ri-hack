import { Button } from '@/components/ui/Button';
import { useUpdateFriendship } from '@/features/users/api/users.mutations';
import type { User } from '@/features/users/types';
import { confirmDestructive } from '@/utils/confirm';

export type RemoveFriendButtonProps = {
  user: Pick<User, 'id' | 'name'>;
  className?: string;
};

/** Unfriending asks for confirmation first, like every destructive action. */
export function RemoveFriendButton({ user, className }: RemoveFriendButtonProps) {
  const { mutate, isPending, isError } = useUpdateFriendship();

  let label = 'Friends · Remove';
  if (isPending) label = 'Removing…';
  else if (isError) label = 'Retry removing';

  const handlePress = () =>
    confirmDestructive({
      title: `Remove ${user.name}?`,
      message: 'They will no longer see you as a friend. You can add them again later.',
      confirmLabel: 'Remove',
      onConfirm: () => mutate({ id: user.id, action: 'unfriend' }),
    });

  return (
    <Button
      variant="soft"
      label={label}
      accessibilityLabel={`Remove ${user.name} as a friend`}
      accessibilityState={{ busy: isPending }}
      disabled={isPending}
      onPress={handlePress}
      className={className}
    />
  );
}
