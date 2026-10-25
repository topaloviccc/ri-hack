import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { useSendFriendRequest, useUpdateFriendship } from '@/features/users/api/users.mutations';
import { FriendRequestActions } from '@/features/users/components/FriendRequestActions';
import type { User } from '@/features/users/types';

export type AddFriendButtonProps = {
  user: Pick<User, 'id' | 'name' | 'relation'>;
  className?: string;
};

/** The friendship action for a person row or card: add, cancel, or answer a request. */
export function AddFriendButton({ user, className }: AddFriendButtonProps) {
  if (user.relation === 'me') return null;
  if (user.relation === 'incoming')
    return <FriendRequestActions user={user} className={className} />;
  if (user.relation === 'requested')
    return <CancelRequestButton user={user} className={className} />;
  if (user.relation === 'friend')
    return <Chip label="Friends" className={className} />;
  return <SendRequestButton user={user} className={className} />;
}

function SendRequestButton({ user, className }: AddFriendButtonProps) {
  const { mutate, isPending, isError } = useSendFriendRequest();
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

function CancelRequestButton({ user, className }: AddFriendButtonProps) {
  const { mutate, isPending, isError } = useUpdateFriendship();
  let label = 'Cancel request';
  if (isPending) label = 'Cancelling…';
  else if (isError) label = 'Retry cancel';

  return (
    <Button
      variant="soft"
      label={label}
      accessibilityLabel={`Cancel your friend request to ${user.name}`}
      accessibilityState={{ busy: isPending }}
      disabled={isPending}
      onPress={() => mutate({ id: user.id, action: 'cancel' })}
      className={className}
    />
  );
}
