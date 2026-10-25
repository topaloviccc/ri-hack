import { apiRequest } from '@/lib/api-client';
import { authSession } from '@/lib/auth-session';
import { env } from '@/lib/env';
import { httpResponse } from '@/test-support/api-fixture';

describe('HTTP client', () => {
  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
  const initialEnv = { ...env };
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });
  afterEach(() => {
    Object.assign(env, initialEnv);
    jest.useRealTimers();
  });

  it('encodes filters, empty ID selections and the bearer token', async () => {
    fetchMock.mockResolvedValue(httpResponse([]));
    await apiRequest('/courses', {
      query: { ids: [], countryCode: 'ME', unused: undefined },
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/courses?ids=&countryCode=ME');
    expect(init?.headers).toEqual(expect.objectContaining({ Authorization: 'Bearer test-token' }));
  });

  it('sends quiz answers as JSON with auth and idempotency headers', async () => {
    fetchMock.mockResolvedValue(httpResponse({ attemptId: 'attempt' }));
    const body = { answers: [{ questionId: 'question', optionIds: ['a', 'b'] }] };
    await apiRequest('/courses/course/learning/quizzes/quiz/attempts', {
      method: 'POST',
      body,
      headers: { 'Idempotency-Key': 'retry-key' },
    });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      body: JSON.stringify(body),
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
        'Idempotency-Key': 'retry-key',
      }),
    });
  });

  it('normalizes Problem Detail and rejects malformed success JSON', async () => {
    fetchMock.mockResolvedValueOnce(httpResponse({ detail: 'Course not found' }, 404));
    await expect(apiRequest('/courses/missing')).rejects.toMatchObject({
      status: 404,
      message: 'Course not found',
    });
    fetchMock.mockResolvedValueOnce(httpResponse({ detail: 'Quote expired', code: 'QUOTE_EXPIRED' }, 409));
    await expect(apiRequest('/benefits/offers/id/activate', { method: 'POST' })).rejects.toMatchObject({
      status: 409, details: { code: 'QUOTE_EXPIRED' },
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '<html>',
    } as Response);
    await expect(apiRequest('/courses')).rejects.toMatchObject({ status: 502 });
  });

  it('handles 204 and network errors without mock fallback', async () => {
    fetchMock.mockResolvedValueOnce(httpResponse(undefined, 204));
    await expect(apiRequest('/courses/id/dismiss', { method: 'POST' })).resolves.toBeUndefined();
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    await expect(apiRequest('/courses')).rejects.toMatchObject({
      status: 0,
      message: expect.stringContaining('Cannot reach'),
    });
  });

  it('serializes JSON bodies and preserves bodyless POST requests', async () => {
    fetchMock.mockResolvedValue(httpResponse({}));
    await apiRequest('/benefits/offers/id/activate', {
      method: 'POST', body: { quoteId: 'quote-id', termsVersion: 2 },
      headers: { 'Idempotency-Key': 'activation-1' },
    });
    expect(fetchMock).toHaveBeenLastCalledWith(expect.any(String), expect.objectContaining({
      body: '{"quoteId":"quote-id","termsVersion":2}',
      headers: expect.objectContaining({ 'Content-Type': 'application/json', 'Idempotency-Key': 'activation-1' }),
    }));
    await apiRequest('/courses/id/unlock', { method: 'POST' });
    expect(fetchMock.mock.calls[1][1]?.body).toBeUndefined();
    expect(fetchMock.mock.calls[1][1]?.headers).not.toHaveProperty('Content-Type');
  });

  it('requires explicit server configuration', async () => {
    env.apiUrl = undefined;
    await expect(apiRequest('/courses')).rejects.toMatchObject({ status: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('signs out on a rejected token and then omits it', async () => {
    fetchMock.mockResolvedValue(httpResponse({ detail: 'Unauthorized' }, 401));
    await expect(apiRequest('/users/me')).rejects.toMatchObject({ status: 401 });
    expect(authSession.get()).toBeNull();
    await expect(apiRequest('/users/me')).rejects.toMatchObject({ status: 401 });
    expect(fetchMock.mock.calls[1][1]?.headers).not.toHaveProperty('Authorization');
  });

  it('aborts timed-out requests and reports a retryable transport error', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const pending = expect(apiRequest('/courses')).rejects.toMatchObject({
      status: 0,
      message: expect.stringContaining('timed out'),
    });
    await jest.advanceTimersByTimeAsync(15_000);
    await pending;
  });
});
