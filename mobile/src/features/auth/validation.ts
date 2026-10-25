import type { AuthMode } from '@/features/auth/types';

// Same rules the backend enforces (AuthService), so most mistakes are caught before a request.
const USERNAME = /^[A-Za-z0-9._]{3,50}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72;
const MAX_NAME = 100;

export type AuthFormValues = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

export type AuthFormErrors = Partial<Record<keyof AuthFormValues, string>>;

const nameError = (value: string, field: string) => {
  const trimmed = value.trim();
  if (!trimmed) return `Add your ${field}.`;
  if (trimmed.length > MAX_NAME) return `Keep your ${field} under ${MAX_NAME} characters.`;
  return undefined;
};

export function validateAuthForm(mode: AuthMode, values: AuthFormValues): AuthFormErrors {
  const errors: AuthFormErrors = {};
  if (!values.email.trim()) errors.email = 'Add your email.';
  else if (!EMAIL.test(values.email.trim())) errors.email = 'Enter a valid email.';
  if (!values.password) errors.password = 'Add your password.';
  if (mode === 'login') return errors;

  const firstName = nameError(values.firstName, 'first name');
  if (firstName) errors.firstName = firstName;
  const lastName = nameError(values.lastName, 'last name');
  if (lastName) errors.lastName = lastName;
  if (!USERNAME.test(values.username)) {
    errors.username = 'Use 3–50 letters, digits, dots or underscores.';
  }
  if (
    values.password &&
    (values.password.length < MIN_PASSWORD || values.password.length > MAX_PASSWORD)
  ) {
    errors.password = `Use ${MIN_PASSWORD}–${MAX_PASSWORD} characters.`;
  }
  return errors;
}
