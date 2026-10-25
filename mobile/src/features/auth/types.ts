// Mirrors backend AuthDtos (see backend/API.md).
export type LoginRequest = { email: string; password: string };

export type SignupRequest = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  timezone: string;
};

/** `user` is a full UserResponse; only its id is needed to start a session. */
export type AuthResponse = { token: string; user: { id: string } };

export const AUTH_MODES = ['login', 'signup'] as const;
export type AuthMode = (typeof AUTH_MODES)[number];
