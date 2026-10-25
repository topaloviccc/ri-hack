import { validateAuthForm } from '@/features/auth/validation';

const VALID = {
  firstName: 'Ana',
  lastName: 'Pejović',
  username: 'ana.p',
  email: 'ana@example.com',
  password: 'correct-horse',
};

describe('validateAuthForm', () => {
  it('accepts valid sign-up and login values', () => {
    expect(validateAuthForm('signup', VALID)).toEqual({});
    expect(validateAuthForm('login', { ...VALID, firstName: '', username: '' })).toEqual({});
  });

  it('login only checks email and password presence', () => {
    expect(validateAuthForm('login', { ...VALID, email: 'nope', password: '' })).toEqual({
      email: 'Enter a valid email.',
      password: 'Add your password.',
    });
  });

  it('sign-up mirrors the backend rules', () => {
    const errors = validateAuthForm('signup', {
      firstName: ' ',
      lastName: 'P',
      username: 'a!',
      email: 'ana@example.com',
      password: 'short',
    });
    expect(Object.keys(errors).sort()).toEqual(['firstName', 'password', 'username']);
  });
});
