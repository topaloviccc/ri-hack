import type { CouponStatus, Offer } from '@/features/benefits/types';
import { capitalize } from '@/utils/format';

// Backend availability codes (BenefitCatalogService); unknown codes fall back to readable text.
const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Not available',
  EXPIRED: 'Offer has ended',
  SOLD_OUT: 'Sold out',
  LIMIT_REACHED: 'Limit reached',
};

export const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  ACTIVE: 'Active',
  REDEEMED: 'Used',
  EXPIRED: 'Expired',
};

export const availabilityLabel = (availability: string) =>
  AVAILABILITY_LABELS[availability] ?? capitalize(availability.toLowerCase().replace(/_/g, ' '));

/** Why an offer can't be redeemed: the server's reason, else its availability. */
export const unavailableReason = (offer: Offer) =>
  offer.reasonIfIneligible ?? availabilityLabel(offer.availability);
