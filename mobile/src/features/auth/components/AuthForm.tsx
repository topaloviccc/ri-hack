import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { FormField } from '@/components/shared/FormField';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useLogin, useSignup } from '@/features/auth/api/auth.mutations';
import type { AuthMode } from '@/features/auth/types';
import { validateAuthForm, type AuthFormErrors } from '@/features/auth/validation';

const MODE_OPTIONS = [
  { value: 'login', label: 'Log in' },
  { value: 'signup', label: 'Sign up' },
] as const satisfies readonly { value: AuthMode; label: string }[];

const EMPTY_FIELDS = { firstName: '', lastName: '', username: '', email: '', password: '' };
type Fields = typeof EMPTY_FIELDS;

const deviceTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

/** Log in or create an account; a successful submit starts the session. */
export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const login = useLogin();
  const signup = useSignup();
  const active = mode === 'login' ? login : signup;
  const isSignup = mode === 'signup';

  const [hasSubmitted, setHasSubmitted] = useState(false);
  // Errors show after the first submit attempt, then update live as fields are fixed.
  const errors: AuthFormErrors = hasSubmitted ? validateAuthForm(mode, fields) : {};

  const field = (key: keyof Fields) => ({
    value: fields[key],
    onChangeText: (value: string) => setFields((current) => ({ ...current, [key]: value })),
    editable: !active.isPending,
    className: errors[key] ? 'border-primary' : undefined,
  });

  const handleModeChange = (next: AuthMode) => {
    login.reset();
    signup.reset();
    setHasSubmitted(false);
    setMode(next);
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    if (Object.keys(validateAuthForm(mode, fields)).length > 0) return;
    if (isSignup) signup.mutate({ ...fields, timezone: deviceTimezone() });
    else login.mutate({ email: fields.email, password: fields.password });
  };

  const submitLabel = isSignup ? 'Create account' : 'Log in';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center gap-4 p-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <Text variant="title" accessibilityRole="header">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text variant="caption">
            {isSignup ? 'New explorers start with 500 coins.' : 'Log in to keep exploring.'}
          </Text>
        </View>
        <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={handleModeChange} />
        {isSignup ? (
          <>
            <FormField error={errors.firstName}>
              <TextField
                placeholder="First name"
                accessibilityLabel="First name"
                autoComplete="given-name"
                {...field('firstName')}
              />
            </FormField>
            <FormField error={errors.lastName}>
              <TextField
                placeholder="Last name"
                accessibilityLabel="Last name"
                autoComplete="family-name"
                {...field('lastName')}
              />
            </FormField>
            <FormField error={errors.username}>
              <TextField
                placeholder="Username"
                accessibilityLabel="Username"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                {...field('username')}
              />
            </FormField>
          </>
        ) : null}
        <FormField error={errors.email}>
          <TextField
            placeholder="Email"
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            {...field('email')}
          />
        </FormField>
        <FormField error={errors.password}>
          <TextField
            placeholder="Password"
            accessibilityLabel="Password"
            secureTextEntry
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            onSubmitEditing={handleSubmit}
            {...field('password')}
          />
        </FormField>
        {active.isError ? (
          <Text variant="caption" accessibilityRole="alert" className="text-primary">
            {active.error.message}
          </Text>
        ) : null}
        <Button
          label={active.isPending ? 'Please wait…' : submitLabel}
          onPress={handleSubmit}
          disabled={active.isPending}
          accessibilityState={{ disabled: active.isPending, busy: active.isPending }}
          className="self-stretch"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
