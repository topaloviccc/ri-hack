import { walletApi } from '@/features/wallet/api/wallet.api';
import { httpResponse } from '@/test-support/api-fixture';

describe('wallet HTTP adapter', () => {
  const courseId = '10000000-0000-0000-0000-000000000001';
  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  it('sends the same purchase key on retry and returns server balances', async () => {
    fetchMock.mockResolvedValue(httpResponse({ balance: 60, heldBalance: 20, availableBalance: 40 }));
    const input = { courseId, idempotencyKey: 'purchase-1' };
    expect(await walletApi.unlockCourse(input)).toEqual({ balance: 60, heldBalance: 20, availableBalance: 40 });
    expect(await walletApi.unlockCourse(input)).toEqual({ balance: 60, heldBalance: 20, availableBalance: 40 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining(`/courses/${courseId}/unlock`),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-User-Id': process.env.EXPO_PUBLIC_USER_ID,
          'Idempotency-Key': 'purchase-1',
        }),
      }),
    );
  });

  it('surfaces server purchase errors without changing local ownership or balance', async () => {
    fetchMock.mockResolvedValue(httpResponse({ status: 402, detail: 'Not enough coins' }, 402));
    await expect(
      walletApi.unlockCourse({ courseId, idempotencyKey: 'purchase-2' }),
    ).rejects.toMatchObject({ status: 402, message: 'Not enough coins' });
  });
});
