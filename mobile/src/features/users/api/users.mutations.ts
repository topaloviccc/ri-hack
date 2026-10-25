import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '@/features/users/api/users.api';
import { userKeys } from '@/features/users/api/users.queries';
import type { FriendshipAction, User } from '@/features/users/types';
import { invalidateFriendshipScoped } from '@/lib/query-client';

function useStoreRelation() {
  const queryClient = useQueryClient();
  return (user: User) => {
    queryClient.setQueryData(userKeys.detail(user.id), user);
    return Promise.all([
      // Suggested lists, search results, friend strips and requests all show relation state.
      queryClient.invalidateQueries({ queryKey: [...userKeys.all, 'list'] }),
      // Gaining or losing a friend changes the network feed and leaderboard.
      invalidateFriendshipScoped(queryClient),
    ]);
  };
}

export function useSendFriendRequest() {
  const storeRelation = useStoreRelation();
  return useMutation({
    mutationFn: (id: string) => usersApi.sendFriendRequest(id),
    onSuccess: storeRelation,
  });
}

/** Accept, decline or cancel a request, or remove a friend; `id` is the other user. */
export function useUpdateFriendship() {
  const storeRelation = useStoreRelation();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: FriendshipAction }) =>
      usersApi.updateFriendship(id, action),
    onSuccess: storeRelation,
  });
}
