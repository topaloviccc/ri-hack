import type { User } from '@/features/users/types';

export type UserResponse = Omit<User, 'avatarUrl' | 'countryCode'> & {
  avatarUrl: string | null;
  countryCode: string | null;
};
