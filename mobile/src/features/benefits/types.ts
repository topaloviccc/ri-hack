import type { Wallet } from '@/features/wallet';

export type Partner = { id: string; name: string; logoUrl: string | null; isDemo: boolean };
export type Country = { code: string; name: string };
export type Venue = { id: string; name: string; countryCode: string; countryName: string };
export type Offer = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  partner: Partner;
  eligibleCountries: Country[];
  venues: Venue[];
  priceCoins: number;
  terms: string;
  termsVersion: number;
  availability: string;
  eligible: boolean;
  reasonIfIneligible: string | null;
  isDemo: boolean;
};
export type Page<T> = { items: T[]; page: number; size: number; total: number };
export type CouponStatus = 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
export type Coupon = {
  id: string;
  status: CouponStatus;
  offer: Offer;
  priceCoins: number;
  issuedAt: string;
  expiresAt: string;
  redemptionCode: string;
  serverNow: string;
};
export type CouponMutation = { coupon: Coupon; wallet: Wallet; serverNow: string };
export type OfferSort = 'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST';
export type OfferFilters = {
  q?: string;
  partnerId?: string;
  countryCode?: string;
  sort?: OfferSort;
};
export type CouponSegment = 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
export type ActivateInput = { offerId: string };
