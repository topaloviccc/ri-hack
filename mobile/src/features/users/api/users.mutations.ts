import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '@/features/users/api/users.api';
import { userKeys } from '@/features/users/api/users.queries';

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.sendFriendRequest(id),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);
      // Suggested lists, search results and friend strips all show relation state.
      queryClient.invalidateQueries({ queryKey: [...userKeys.all, 'list'] });
    },
  });
}
