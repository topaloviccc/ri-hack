import { infiniteQueryOptions, queryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { benefitsApi } from '@/features/benefits/api/benefits.api';
import type { CouponSegment, OfferFilters } from '@/features/benefits/types';
import { env } from '@/lib/env';

export const benefitsKeys = {
  all: ['benefits'] as const,
  viewer: () => [...benefitsKeys.all, env.userId] as const,
  offerLists: () => [...benefitsKeys.viewer(), 'offers'] as const,
  offerDetails: () => [...benefitsKeys.viewer(), 'offer'] as const,
  partners: (countryCode?: string) => [...benefitsKeys.viewer(), 'partners', countryCode] as const,
  countries: (partnerId?: string) => [...benefitsKeys.viewer(), 'countries', partnerId] as const,
  offers: (filters: OfferFilters) => [...benefitsKeys.viewer(), 'offers', filters] as const,
  offer: (id: string) => [...benefitsKeys.viewer(), 'offer', id] as const,
  coupons: (segment: CouponSegment) => [...benefitsKeys.viewer(), 'coupons', segment] as const,
  coupon: (id: string) => [...benefitsKeys.viewer(), 'coupon', id] as const,
};

const nextPage = <T,>(page: { items: T[]; page: number; size: number; total: number }) =>
  page.items.length > 0 && (page.page + 1) * page.size < page.total ? page.page + 1 : undefined;

export const offersQueryOptions = (filters: OfferFilters) => infiniteQueryOptions({
  queryKey: benefitsKeys.offers(filters), initialPageParam: 0,
  queryFn: ({ pageParam }) => benefitsApi.listOffers(filters, pageParam), getNextPageParam: nextPage,
});
export const couponsQueryOptions = (segment: CouponSegment) => infiniteQueryOptions({
  queryKey: benefitsKeys.coupons(segment), initialPageParam: 0,
  queryFn: ({ pageParam }) => benefitsApi.listCoupons(segment, pageParam), getNextPageParam: nextPage,
  staleTime: 0,
});
export const offerQueryOptions = (id: string) => queryOptions({
  queryKey: benefitsKeys.offer(id), queryFn: () => benefitsApi.getOffer(id), enabled: !!id,
});
export const couponQueryOptions = (id: string) => queryOptions({
  queryKey: benefitsKeys.coupon(id), queryFn: () => benefitsApi.getCoupon(id), enabled: !!id,
  staleTime: 0, gcTime: 0, retry: false,
  refetchInterval: false,
});
export const useOffersQuery = (filters: OfferFilters) => useInfiniteQuery(offersQueryOptions(filters));
export const useCouponsQuery = (segment: CouponSegment) => useInfiniteQuery(couponsQueryOptions(segment));
export const usePartnersQuery = (countryCode?: string) => useQuery(queryOptions({
  queryKey: benefitsKeys.partners(countryCode), queryFn: () => benefitsApi.listPartners(countryCode),
}));
export const useCountriesQuery = (partnerId?: string) => useQuery(queryOptions({
  queryKey: benefitsKeys.countries(partnerId), queryFn: () => benefitsApi.listCountries(partnerId),
}));
