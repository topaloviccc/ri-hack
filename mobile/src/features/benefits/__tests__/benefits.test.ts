import { benefitsApi } from '@/features/benefits/api/benefits.api';
import { benefitsKeys, offersQueryOptions } from '@/features/benefits/api/benefits.queries';
import { BENEFIT_OFFER } from '@/test-support/benefits-fixture';
import { installApiFixture } from '@/test-support/api-fixture';
import { walletApi } from '@/features/wallet/api/wallet.api';

describe('Benefits HTTP adapters', () => {
  beforeEach(() => installApiFixture({ balance: 520 }));

  it('lists and filters offers with isolated cache keys', async () => {
    const filters = { q: 'coffee', partnerId: BENEFIT_OFFER.partner.id, countryCode: 'HR', sort: 'PRICE_ASC' as const };
    const page = await benefitsApi.listOffers(filters, 0, 1);
    expect(page).toMatchObject({ page: 0, size: 1, total: 1, items: [BENEFIT_OFFER] });
    expect((await benefitsApi.listOffers({ ...filters, countryCode: 'IT' })).total).toBe(0);
    expect(offersQueryOptions(filters).queryKey).toEqual(benefitsKeys.offers(filters));
    expect(benefitsKeys.offers(filters)).not.toEqual(benefitsKeys.offers({}));
  });

  it('activates once, immediately spends coins and returns a random coupon code', async () => {
    const result = await benefitsApi.activate({ offerId: BENEFIT_OFFER.id });
    expect(result.wallet).toEqual({ balance: 400, heldBalance: 0, availableBalance: 400 });
    expect(result.coupon).toMatchObject({ status: 'ACTIVE', priceCoins: 120 });
    expect(result.coupon.redemptionCode).toMatch(/^[A-Z0-9]{10}$/);
    await expect(benefitsApi.getCoupon(result.coupon.id)).resolves.toMatchObject({ redemptionCode: result.coupon.redemptionCode });
    expect((await benefitsApi.listCoupons('ACTIVE')).total).toBe(1);
    expect((await walletApi.get()).balance).toBe(400);
  });

  it('expires coupons without refunding their activation cost', async () => {
    const { coupon } = await benefitsApi.activate({ offerId: BENEFIT_OFFER.id });
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse(coupon.expiresAt) + 1);
    expect((await benefitsApi.getCoupon(coupon.id)).status).toBe('EXPIRED');
    expect(await walletApi.get()).toEqual({ balance: 400, heldBalance: 0, availableBalance: 400 });
    jest.useRealTimers();
  });
});
