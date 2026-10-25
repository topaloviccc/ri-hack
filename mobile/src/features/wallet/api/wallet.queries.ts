import { queryOptions, useQuery } from '@tanstack/react-query';

import { walletApi } from '@/features/wallet/api/wallet.api';
import { env } from '@/lib/env';

export const walletKeys = {
  all: ['wallet'] as const,
  detail: () => [...walletKeys.all, 'detail', env.userId] as const,
};

export const walletQueryOptions = () =>
  queryOptions({ queryKey: walletKeys.detail(), queryFn: walletApi.get });

export const useWalletQuery = () => useQuery(walletQueryOptions());
