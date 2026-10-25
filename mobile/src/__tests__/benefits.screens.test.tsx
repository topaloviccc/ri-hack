import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { onlineManager } from '@tanstack/react-query';

import { benefitsApi } from '@/features/benefits/api/benefits.api';
import { walletApi } from '@/features/wallet/api/wallet.api';
import { queryClient } from '@/lib/query-client';
import { BENEFIT_OFFER } from '@/test-support/benefits-fixture';
import { installApiFixture } from '@/test-support/api-fixture';

jest.setTimeout(15_000);
const offerRoute = `/benefits/offer/${BENEFIT_OFFER.id}`;
const renderAt = (initialUrl: string) => renderRouter('./src/app', { initialUrl });

describe('Benefits screens', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    installApiFixture({ balance: 520 });
    queryClient.setDefaultOptions({ queries: { retry: false } });
  });
  afterEach(() => onlineManager.setOnline(true));

  it('shows a simple activation confirmation without terms or a quote', async () => {
    await renderAt(`${offerRoute}/confirm`);
    expect(await screen.findByText('Activate this coupon?')).toBeOnTheScreen();
    expect(screen.getByText('120 coins will be used now.')).toBeOnTheScreen();
    expect(screen.queryByText('Terms')).toBeNull();
  });

  it('activates the coupon and displays its generated code', async () => {
    await renderAt(`${offerRoute}/confirm`);
    await fireEvent.press(await screen.findByText('Activate for 120 coins'));
    expect(await screen.findByText('Your coupon code')).toBeOnTheScreen();
    const { items: [coupon] } = await benefitsApi.listCoupons('ACTIVE');
    expect(screen.getByText(coupon.redemptionCode)).toBeOnTheScreen();
    expect((await benefitsApi.listCoupons('ACTIVE')).total).toBe(1);
  });

  it('updates the wallet immediately after activation', async () => {
    await renderAt(`${offerRoute}/confirm`);
    await fireEvent.press(await screen.findByText('Activate for 120 coins'));
    expect((await benefitsApi.listCoupons('ACTIVE')).total).toBe(1);
    expect(await walletApi.get()).toMatchObject({ balance: 400, availableBalance: 400 });
  });
});
