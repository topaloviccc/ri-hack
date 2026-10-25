import { authSession } from '@/lib/auth-session';
import { env } from '@/lib/env';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const REQUEST_TIMEOUT_MS = 15_000;
type QueryValue = string | number | boolean | readonly string[] | undefined;
type JsonValue =
  string | number | boolean | null | readonly JsonValue[] | { [key: string]: JsonValue };
type RequestOptions = {
  method?: 'GET' | 'POST';
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  body?: JsonValue;
};

const errorMessage = (body: unknown, fallback: string) => {
  if (body && typeof body === 'object') {
    if ('detail' in body && typeof body.detail === 'string') return body.detail;
    if ('message' in body && typeof body.message === 'string') return body.message;
  }
  return fallback;
};

/** All remote feature adapters use this client; failures never fall back to mock records. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!env.apiUrl) throw new ApiError(400, 'Set EXPO_PUBLIC_API_URL to connect to the server.');
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined)
      params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), REQUEST_TIMEOUT_MS);
  const session = authSession.get();
  try {
    const response = await fetch(`${env.apiUrl}${path}${suffix}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers,
      },
      signal: abort.signal,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
    const raw = await response.text();
    let body: unknown;
    try {
      body = raw ? JSON.parse(raw) : undefined;
    } catch {
      if (response.ok) throw new ApiError(502, 'The server returned an invalid response.');
    }
    // An expired or revoked token signs the user out; the root layout then shows sign-in.
    if (response.status === 401 && session) void authSession.clear();
    if (!response.ok) {
      throw new ApiError(
        response.status,
        errorMessage(body, `Request failed (${response.status}).`),
        body,
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      abort.signal.aborted
        ? 'The request timed out. Please try again.'
        : 'Cannot reach the server. Check your connection and API URL.',
      error,
    );
  } finally {
    clearTimeout(timer);
  }
}
