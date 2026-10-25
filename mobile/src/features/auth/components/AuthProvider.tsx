import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

import { settingsKeys } from '@/features/settings';
import { authSession } from '@/lib/auth-session';

export type AuthStatus = 'restoring' | 'signedIn' | 'signedOut';
type AuthContextValue = { status: AuthStatus; signOut: () => Promise<void> };

const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = { children: ReactNode };

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const session = useSyncExternalStore(authSession.subscribe, authSession.get);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    authSession.restore().finally(() => setIsRestored(true));
  }, []);

  // Server data belongs to whoever was signed in; drop it on every session change
  // (login, logout, or a 401). Local settings such as the theme are not per-user.
  useEffect(
    () =>
      authSession.subscribe(() =>
        queryClient.removeQueries({
          predicate: (query) => query.queryKey[0] !== settingsKeys.all[0],
        }),
      ),
    [queryClient],
  );

  const status: AuthStatus = !isRestored ? 'restoring' : session ? 'signedIn' : 'signedOut';
  return (
    <AuthContext.Provider value={{ status, signOut: authSession.clear }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
