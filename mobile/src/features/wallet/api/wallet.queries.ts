import { queryOptions, useQuery } from '@tanstack/react-query';

import { walletApi } from '@/features/wallet/api/wallet.api';

export const walletKeys = {
  all: ['wallet'] as const,
  detail: () => [...walletKeys.all, 'detail'] as const,
};

export const walletQueryOptions = () =>
  queryOptions({ queryKey: walletKeys.detail(), queryFn: walletApi.get });

export const useWalletQuery = () => useQuery(walletQueryOptions());
