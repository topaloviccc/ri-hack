import { apiRequest } from '@/lib/api-client';
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

  it('encodes filters, empty ID selections and viewer context', async () => {
    fetchMock.mockResolvedValue(httpResponse([]));
    await apiRequest('/courses', {
      viewer: true,
      query: { ids: [], countryCode: 'ME', unused: undefined },
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/courses?ids=&countryCode=ME');
    expect(init?.headers).toEqual(expect.objectContaining({ 'X-User-Id': env.userId }));
  });

  it('normalizes Problem Detail and rejects malformed success JSON', async () => {
    fetchMock.mockResolvedValueOnce(httpResponse({ detail: 'Course not found' }, 404));
    await expect(apiRequest('/courses/missing')).rejects.toMatchObject({
      status: 404,
      message: 'Course not found',
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

  it('requires explicit server and viewer configuration', async () => {
    env.apiUrl = undefined;
    await expect(apiRequest('/courses')).rejects.toMatchObject({ status: 400 });
    env.apiUrl = initialEnv.apiUrl;
    env.userId = undefined;
    await expect(apiRequest('/courses', { viewer: true })).rejects.toMatchObject({ status: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
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
