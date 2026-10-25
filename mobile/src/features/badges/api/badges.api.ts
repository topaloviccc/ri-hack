import type { BadgeResponse, BadgeSummary, ScanResponse } from './badges.dto';
import { apiRequest } from '@/lib/api-client';

export const badgesApi = {
  getById: (id: string) => apiRequest<BadgeResponse>(`/badges/${encodeURIComponent(id)}`),
  listForUser: (userId: string) =>
    apiRequest<BadgeSummary[]>(`/users/${encodeURIComponent(userId)}/badges`),
  /** Collects the badge a tag's code awards; 404 when the code isn't an active badge tag. */
  scan: (code: string) =>
    apiRequest<ScanResponse>('/badges/scan', { method: 'POST', body: { code } }),
};
