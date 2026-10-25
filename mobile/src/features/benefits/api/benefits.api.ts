import type {
  ActivateInput, Country, Coupon, CouponMutation, CouponSegment,
  Offer, OfferFilters, Page, Partner,
} from '@/features/benefits/types';
import { apiRequest } from '@/lib/api-client';

const offerPath = (id: string) => `/benefits/offers/${encodeURIComponent(id)}`;
const couponPath = (id: string) => `/benefits/coupons/${encodeURIComponent(id)}`;

export const benefitsApi = {
  listPartners: (countryCode?: string): Promise<Partner[]> =>
    apiRequest('/benefits/partners', { query: { countryCode } }),
  listCountries: (partnerId?: string): Promise<Country[]> =>
    apiRequest('/benefits/countries', { query: { partnerId } }),
  listOffers: (filters: OfferFilters, page = 0, size = 20): Promise<Page<Offer>> =>
    apiRequest('/benefits/offers', { query: { ...filters, page, size } }),
  getOffer: (id: string): Promise<Offer> => apiRequest(offerPath(id)),
  activate: ({ offerId }: ActivateInput): Promise<CouponMutation> =>
    apiRequest(`${offerPath(offerId)}/activate`, { method: 'POST' }),
  listCoupons: (segment: CouponSegment, page = 0, size = 20): Promise<Page<Coupon>> =>
    apiRequest('/benefits/coupons', {
      query: { status: segment, page, size },
    }),
  getCoupon: (id: string): Promise<Coupon> => apiRequest(couponPath(id)),
  markUsed: (id: string): Promise<Coupon> =>
    apiRequest(`${couponPath(id)}/mark-used`, { method: 'POST' }),
};
