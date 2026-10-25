import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { authSession } from '@/lib/auth-session';
import { installApiFixture } from '@/test-support/api-fixture';

const APP_DIR = './src/app';
jest.setTimeout(15_000);

describe('sign-in gate', () => {
  beforeEach(async () => {
    installApiFixture();
    await authSession.clear();
  });

  const logIn = async (password: string) => {
    await renderRouter(APP_DIR, { initialUrl: '/' });
    expect(await screen.findByText('Welcome back')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Email'), 'demo.learner@example.test');
    await fireEvent.changeText(screen.getByLabelText('Password'), password);
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
  };

  it('shows sign-in when signed out, then the app after logging in', async () => {
    await logIn('demo1234');
    expect(await screen.findByText('Continue with…')).toBeOnTheScreen();
    expect(authSession.get()?.token).toBe('fixture-token');
  });

  it('keeps the user on sign-in with the server message for bad credentials', async () => {
    await logIn('wrong password');
    expect(await screen.findByText('Invalid email or password')).toBeOnTheScreen();
    expect(authSession.get()).toBeNull();
  });

  it('switches to the sign-up form', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });
    await fireEvent.press(await screen.findByText('Sign up'));
    expect(screen.getByText('Create your account')).toBeOnTheScreen();
    expect(screen.getByLabelText('Username')).toBeOnTheScreen();
  });

  const signUp = async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });
    await fireEvent.press(await screen.findByText('Sign up'));
    for (const [label, value] of Object.entries({
      'First name': 'New',
      'Last name': 'Learner',
      Username: 'new_learner',
      Email: 'new@example.test',
      Password: 'demo1234',
    }))
      await fireEvent.changeText(screen.getByLabelText(label), value);
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('What do you want to explore?')).toBeOnTheScreen();
  };

  it('collects interests after signup', async () => {
    await signUp();
    await fireEvent.press(await screen.findByRole('checkbox', { name: 'History' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Start exploring' }));
    expect(await screen.findByText('Continue with…')).toBeOnTheScreen();
    const saved = (globalThis.fetch as jest.Mock).mock.calls.find(
      ([url, init]) => String(url).endsWith('/users/me/interests') && init?.method === 'POST',
    );
    expect(JSON.parse(saved?.[1].body)).toEqual({ fieldIds: ['history'] });
  });

  it('persists skipping onboarding with empty interests', async () => {
    await signUp();
    await fireEvent.press(await screen.findByRole('button', { name: 'Skip for now' }));
    expect(await screen.findByText('Continue with…')).toBeOnTheScreen();
    const saved = (globalThis.fetch as jest.Mock).mock.calls.find(
      ([url, init]) => String(url).endsWith('/users/me/interests') && init?.method === 'POST',
    );
    expect(JSON.parse(saved?.[1].body)).toEqual({ fieldIds: [] });
  });
});
