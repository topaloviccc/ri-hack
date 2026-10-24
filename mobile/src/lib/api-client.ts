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
type RequestOptions = {
  method?: 'GET' | 'POST';
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  viewer?: boolean;
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
  if (options.viewer && !env.userId) {
    throw new ApiError(400, 'Set EXPO_PUBLIC_USER_ID to an existing user UUID.');
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined)
      params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${env.apiUrl}${path}${suffix}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.viewer && env.userId ? { 'X-User-Id': env.userId } : {}),
        ...options.headers,
      },
      signal: abort.signal,
    });
    const raw = await response.text();
    let body: unknown;
    try {
      body = raw ? JSON.parse(raw) : undefined;
    } catch {
      if (response.ok) throw new ApiError(502, 'The server returned an invalid response.');
    }
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
