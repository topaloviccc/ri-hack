import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type AuthSession = { token: string; userId: string };
type Listener = (session: AuthSession | null) => void;

const KEY = 'auth.session';
// expo-secure-store has no web implementation, so web sessions last until reload.
const isPersistent = Platform.OS !== 'web';

let current: AuthSession | null = null;
const listeners = new Set<Listener>();

const isSession = (value: unknown): value is AuthSession =>
  !!value &&
  typeof value === 'object' &&
  'token' in value &&
  typeof value.token === 'string' &&
  'userId' in value &&
  typeof value.userId === 'string';

const publish = (session: AuthSession | null) => {
  current = session;
  listeners.forEach((listener) => listener(session));
};

/** The signed-in user's bearer token. Read synchronously by the API client. */
export const authSession = {
  get: () => current,

  async restore() {
    if (!isPersistent) return current;
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      publish(isSession(parsed) ? parsed : null);
    } catch {
      publish(null);
    }
    return current;
  },

  async set(session: AuthSession) {
    publish(session);
    if (isPersistent) await SecureStore.setItemAsync(KEY, JSON.stringify(session));
  },

  async clear() {
    if (!current) return;
    publish(null);
    if (isPersistent) await SecureStore.deleteItemAsync(KEY);
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
