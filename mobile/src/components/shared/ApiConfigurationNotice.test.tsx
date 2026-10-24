import { render, screen } from '@testing-library/react-native';

import { ApiConfigurationNotice } from './ApiConfigurationNotice';
import { env } from '@/lib/env';

describe('API setup notice', () => {
  const configured = { ...env };
  afterEach(() => Object.assign(env, configured));

  it('explains missing settings instead of leaving only generic query errors', async () => {
    env.apiUrl = undefined;
    env.userId = undefined;
    await render(<ApiConfigurationNotice />);
    expect(screen.getByText('Backend setup required')).toBeOnTheScreen();
    expect(screen.getByText(/EXPO_PUBLIC_API_URL and EXPO_PUBLIC_USER_ID/)).toBeOnTheScreen();
    expect(screen.getByText(/stop before reaching the network/)).toBeOnTheScreen();
  });

  it('does not show setup instructions once the app is configured', async () => {
    await render(<ApiConfigurationNotice />);
    expect(screen.queryByText('Backend setup required')).toBeNull();
  });
});
