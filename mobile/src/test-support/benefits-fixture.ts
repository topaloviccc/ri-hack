import type { Coupon, Offer, Page } from '@/features/benefits/types';
import type { Wallet } from '@/features/wallet';

const response = (body: unknown, status = 200) => ({ ok: status < 400, status, text: async () => JSON.stringify(body) }) as Response;
export const BENEFIT_OFFER: Offer = {
  id: '22222222-2222-4222-8222-222222222222', title: 'Free coffee (S or M)',
  subtitle: 'One selected hot drink', description: 'Show your coupon at the counter.', imageUrl: null,
  partner: { id: '33333333-3333-4333-8333-333333333333', name: 'City Café', logoUrl: null, isDemo: true },
  eligibleCountries: [{ code: 'HR', name: 'Croatia' }],
  venues: [{ id: '55555555-5555-4555-8555-555555555555', name: 'Zagreb café', countryCode: 'HR', countryName: 'Croatia' }],
  priceCoins: 120, terms: 'One drink per coupon. Present at a participating café.', termsVersion: 1,
  availability: 'AVAILABLE', eligible: true, reasonIfIneligible: null, isDemo: true,
};
export const BENEFIT_OFFERS: Offer[] = [BENEFIT_OFFER, {
  ...BENEFIT_OFFER, id: '22222222-2222-4222-8222-222222222223', title: 'Museum gift shop discount',
  priceCoins: 180, partner: { ...BENEFIT_OFFER.partner, id: '33333333-3333-4333-8333-333333333334', name: 'Museum Shop' },
  eligibleCountries: [{ code: 'IT', name: 'Italy' }],
  venues: [{ id: '55555555-5555-4555-8555-555555555556', name: 'Museum shop', countryCode: 'IT', countryName: 'Italy' }],
}];

export function createBenefitsFixture({ getBalance, spendCoins }: { getBalance: () => number; spendCoins: (amount: number) => void }) {
  const coupons = new Map<string, Coupon>();
  const now = () => new Date().toISOString();
  const reconcile = () => {
    for (const [id, coupon] of coupons) if (coupon.status === 'ACTIVE' && Date.parse(coupon.expiresAt) <= Date.now())
      coupons.set(id, { ...coupon, status: 'EXPIRED' });
  };
  const walletNow = (): Wallet => ({ balance: getBalance(), heldBalance: 0, availableBalance: getBalance() });
  const withTime = (coupon: Coupon): Coupon => ({ ...coupon, serverNow: now() });
  const page = <T,>(items: T[], url: URL): Page<T> => {
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);
    return { items: items.slice(page * size, (page + 1) * size), page, size, total: items.length };
  };
  return {
    handle: (url: URL, init: RequestInit | undefined, wallet: Wallet): Response => {
      reconcile();
      const path = url.pathname.replace(/^\/api\/benefits\//, '');
      const params = url.searchParams;
      if (path === 'partners') return response(BENEFIT_OFFERS.filter((o) => !params.get('countryCode') || o.eligibleCountries.some((c) => c.code === params.get('countryCode'))).map((o) => o.partner));
      if (path === 'countries') return response(BENEFIT_OFFERS.filter((o) => !params.get('partnerId') || o.partner.id === params.get('partnerId')).flatMap((o) => o.eligibleCountries));
      if (path === 'offers') {
        let items = BENEFIT_OFFERS.filter((o) => (!params.get('partnerId') || o.partner.id === params.get('partnerId')) &&
          (!params.get('countryCode') || o.eligibleCountries.some((c) => c.code === params.get('countryCode'))) &&
          (!params.get('q') || o.title.toLowerCase().includes((params.get('q') ?? '').toLowerCase())));
        if (params.get('sort') === 'PRICE_DESC') items = [...items].sort((a, b) => b.priceCoins - a.priceCoins);
        if (params.get('sort') === 'PRICE_ASC') items = [...items].sort((a, b) => a.priceCoins - b.priceCoins);
        return response(page(items, url));
      }
      const [kind, id, action] = path.split('/');
      if (kind === 'offers') {
        const offer = BENEFIT_OFFERS.find((o) => o.id === id);
        if (!offer) return response({ detail: 'Offer not found' }, 404);
        if (!action) return response(offer);
        if (action === 'activate') {
          if (wallet.availableBalance < offer.priceCoins) return response({ detail: 'Not enough coins' }, 402);
          spendCoins(offer.priceCoins);
          const coupon: Coupon = { id: `44444444-4444-4444-8444-${String(coupons.size + 1).padStart(12, '0')}`, status: 'ACTIVE',
            offer, priceCoins: offer.priceCoins, issuedAt: now(), expiresAt: new Date(Date.now() + 900_000).toISOString(),
            redemptionCode: Math.random().toString(36).slice(2, 12).toUpperCase(), serverNow: now() };
          coupons.set(coupon.id, coupon);
          return response({ coupon, wallet: walletNow(), serverNow: now() }, 201);
        }
      }
      if (path === 'coupons') {
        const statuses = (params.get('status') ?? '').split(',');
        return response(page([...coupons.values()].filter((c) => statuses.includes(c.status)).reverse().map(withTime), url));
      }
      if (kind === 'coupons') {
        const coupon = coupons.get(id);
        if (!coupon) return response({ detail: 'Coupon not found' }, 404);
        if (action === 'mark-used') {
          if (coupon.status !== 'ACTIVE') return response({ detail: 'Coupon is not active' }, 409);
          const used = { ...coupon, status: 'REDEEMED' as const };
          coupons.set(id, used);
          return response(withTime(used));
        }
        return response(withTime(coupon));
      }
      return response({ detail: 'Not found' }, 404);
    },
  };
}
