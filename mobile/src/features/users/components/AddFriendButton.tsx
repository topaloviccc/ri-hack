import { Button } from '@/components/ui/Button';
import { useSendFriendRequest } from '@/features/users/api/users.mutations';
import type { User } from '@/features/users/types';

const LABELS = { friend: 'Friends', requested: 'Requested' } as const;

export type AddFriendButtonProps = {
  user: Pick<User, 'id' | 'name' | 'relation'>;
  className?: string;
};

export function AddFriendButton({ user, className }: AddFriendButtonProps) {
  const { mutate, isPending, isError } = useSendFriendRequest();
  if (user.relation === 'me') return null;

  if (user.relation !== 'none') {
    return <Button variant="soft" label={LABELS[user.relation]} disabled className={className} />;
  }
  let label = 'Add';
  if (isPending) label = 'Sending…';
  else if (isError) label = 'Retry';

  return (
    <Button
      label={label}
      accessibilityLabel={`Add ${user.name} as a friend`}
      accessibilityState={{ busy: isPending }}
      disabled={isPending}
      onPress={() => mutate(user.id)}
      className={className}
    />
  );
}
