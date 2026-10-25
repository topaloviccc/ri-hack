import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/features/auth/api/auth.api';
import type { LoginRequest, SignupRequest } from '@/features/auth/types';
import { authSession } from '@/lib/auth-session';

// Starting a session resets cached server data; AuthProvider owns that on every session change.
export const useLogin = () =>
  useMutation({
    mutationFn: (input: LoginRequest) => authApi.login(input),
    onSuccess: (session) => authSession.set(session),
  });

export const useSignup = () =>
  useMutation({
    mutationFn: (input: SignupRequest) => authApi.signup(input),
    onSuccess: (session) => authSession.set(session),
  });
