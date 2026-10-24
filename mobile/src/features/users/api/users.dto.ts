import type { User } from '@/features/users/types';

export type UserResponse = Omit<User, 'bio' | 'avatarUrl' | 'countryCode'> & {
  avatarUrl: string | null;
  countryCode: string | null;
};
