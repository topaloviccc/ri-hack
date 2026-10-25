import type { AuthResponse, LoginRequest, SignupRequest } from '@/features/auth/types';
import { apiRequest } from '@/lib/api-client';
import type { AuthSession } from '@/lib/auth-session';

const toSession = (response: AuthResponse): AuthSession => ({
  token: response.token,
  userId: response.user.id,
});

export const authApi = {
  login: async (input: LoginRequest): Promise<AuthSession> =>
    toSession(await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: input })),
  signup: async (input: SignupRequest): Promise<AuthSession> =>
    toSession(await apiRequest<AuthResponse>('/auth/signup', { method: 'POST', body: input })),
};
