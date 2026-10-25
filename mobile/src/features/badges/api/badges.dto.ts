/** Mirrors the backend's BadgeDtos (see backend/API.md). */
export type BadgeResponse = {
  id: string;
  name: string;
  hook: string | null;
  subtitle: string | null;
  /** Markdown; null until the viewer has collected the badge. */
  story: string | null;
  imageUrl: string | null;
  countryCode: string | null;
  rewardCoins: number;
  collected: boolean;
  collectedAt: string | null;
  awardedCoins: number;
};

export type BadgeSummary = {
  id: string;
  name: string;
  hook: string | null;
  imageUrl: string | null;
  collectedAt: string;
};

export type ScanResponse = {
  badge: BadgeResponse;
  newlyCollected: boolean;
  awardedCoins: number;
};
