import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';

import type { BadgeResponse, ScanResponse } from '@/features/badges/api/badges.dto';
import { BadgeScanPage } from '@/features/badges/components/BadgeScanPage';
import { httpResponse } from '@/test-support/api-fixture';

// Keep the real wallet keys without loading the wallet's native animation screens.
jest.mock('@/features/wallet', () => ({
  walletKeys: jest.requireActual('@/features/wallet/api/wallet.queries').walletKeys,
}));

const badge: BadgeResponse = {
  id: 'badge',
  name: 'Trsat Stairs',
  hook: 'The Devil mixed up the stairs. Do you think you can count them?',
  subtitle: "The legend of Rijeka's Trsat stairs (scalinate fiumane)",
  story: 'There is a popular tale about the Trsat Stairs.',
  imageUrl: null,
  countryCode: 'HR',
  rewardCoins: 10,
  collected: true,
  collectedAt: '2026-10-25T10:00:00Z',
  awardedCoins: 10,
};
const scanned = (newlyCollected: boolean): ScanResponse => ({
  badge,
  newlyCollected,
  awardedCoins: newlyCollected ? 10 : 0,
});

describe('scanning a badge tag', () => {
  let fetchMock: jest.MockedFunction<typeof fetch>;
  let client: QueryClient;
  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock;
    client = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
  });
  // Infinity gcTime above plus clear() here leaves no cache timers running after a test.
  afterEach(() => client.clear());
  const mount = () =>
    render(
      <QueryClientProvider client={client}>
        <BadgeScanPage code="trsat-stairs" />
      </QueryClientProvider>,
    );

  it('collects a new badge, says so with the coins, and shows its story', async () => {
    fetchMock.mockResolvedValue(httpResponse(scanned(true)));
    await mount();
    expect(await screen.findByText('Added to your profile · +10 coins')).toBeOnTheScreen();
    expect(screen.getByText('There is a popular tale about the Trsat Stairs.')).toBeOnTheScreen();
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/badges/scan');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ code: 'trsat-stairs' });
  });

  it('tells a repeat scan apart', async () => {
    fetchMock.mockResolvedValue(httpResponse(scanned(false)));
    await mount();
    expect(await screen.findByText('Already in your collection')).toBeOnTheScreen();
  });

  it('says when a tag is not a badge', async () => {
    fetchMock.mockResolvedValue(httpResponse({ detail: 'Badge not found' }, 404));
    await mount();
    expect(await screen.findByText("This tag isn't an Out There badge.")).toBeOnTheScreen();
  });
});
