import { render, screen } from '@testing-library/react-native';

import { CountryFlag } from './CountryFlag';

describe('CountryFlag', () => {
  it('uses the country API image and an accessible full name', async () => {
    await render(<CountryFlag code="ME" name="Montenegro" uri="https://flagcdn.com/w160/me.png" />);
    expect(screen.getByLabelText('Montenegro flag')).toHaveProp('source', [
      {
        uri: 'https://flagcdn.com/w160/me.png',
      },
    ]);
  });

  it('uses hosted flag URLs for code-only profile badges', async () => {
    await render(<CountryFlag code="hr" />);
    expect(screen.getByLabelText('HR flag')).toHaveProp('source', [
      {
        uri: 'https://flagcdn.com/w160/hr.png',
      },
    ]);
  });

  it('omits a flag for an absent optional country', async () => {
    await render(<CountryFlag code="" />);
    expect(screen.queryByLabelText(/flag$/)).toBeNull();
  });
});
