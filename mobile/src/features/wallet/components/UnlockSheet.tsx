import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { DemoNotice } from '@/components/shared/DemoNotice';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/ui/CoinIcon';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { useCourseQuery } from '@/features/courses';
import { useUnlockCourse } from '@/features/wallet/api/wallet.mutations';
import { useWalletQuery } from '@/features/wallet/api/wallet.queries';
import { cn } from '@/lib/cn';

type AmountRowProps = { label: string; amount: number; isEmphasized?: boolean };

function AmountRow({ label, amount, isEmphasized = false }: AmountRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text variant={isEmphasized ? 'label' : 'body'}>{label}</Text>
      <View className="flex-row items-center gap-1.5">
        <CoinIcon />
        <Text variant="label" className={cn(isEmphasized && 'text-base')}>
          {amount}
        </Text>
      </View>
    </View>
  );
}

// A fresh key per sheet: retries reuse it, so a flaky network can never charge twice.
const newIdempotencyKey = () => `unlock-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export type UnlockSheetProps = { courseId: string };

export function UnlockSheet({ courseId }: UnlockSheetProps) {
  const course = useCourseQuery(courseId);
  const wallet = useWalletQuery();
  const unlock = useUnlockCourse();
  const [idempotencyKey] = useState(newIdempotencyKey);

  if (course.isPending || wallet.isPending) return <LoadingState />;
  if (course.isError || wallet.isError) {
    return (
      <ErrorState
        onRetry={() => {
          course.refetch();
          wallet.refetch();
        }}
      />
    );
  }

  const cost = course.data.unlockCost;
  const balance = wallet.data.availableBalance;
  const shortfall = cost - balance;
  const canAfford = shortfall <= 0;

  const handleUnlock = () =>
    unlock.mutate(
      { courseId, idempotencyKey },
      {
        // Back to the details page, which plays the celebration.
        onSuccess: () =>
          router.dismissTo({ pathname: '/course/[id]', params: { id: courseId, celebrate: '1' } }),
      },
    );

  return (
    <View className="gap-5 p-5">
      <View className="flex-row items-center gap-3">
        <Image uri={course.data.imageUrl} className="h-16 w-16 rounded-lg bg-border" />
        <View className="flex-1">
          <Text variant="caption">Unlock this course</Text>
          <DemoNotice>cover image</DemoNotice>
          <Text variant="heading" numberOfLines={2}>
            {course.data.title}
          </Text>
        </View>
      </View>

      <View className="gap-2 rounded-card bg-background p-4">
        <AmountRow label="Cost" amount={cost} />
        <AmountRow label="Available balance" amount={balance} />
        {canAfford ? (
          <AmountRow label="After unlocking" amount={balance - cost} isEmphasized />
        ) : (
          <Text variant="label" className="text-primary">
            You need {shortfall} more coins
          </Text>
        )}
      </View>

      {canAfford ? null : (
        <Text variant="caption" className="text-center">
          Ways to earn coins are coming soon.
        </Text>
      )}
      {unlock.isError ? (
        <Text
          variant="caption"
          className="text-center text-primary"
          accessibilityLiveRegion="polite"
        >
          {unlock.error.message} Please try again.
        </Text>
      ) : null}

      <Button
        label={unlock.isPending ? 'Unlocking…' : `Unlock for ${cost} coins`}
        icon={unlock.isPending ? undefined : <CoinIcon />}
        disabled={!canAfford || unlock.isPending}
        accessibilityState={{ disabled: !canAfford || unlock.isPending, busy: unlock.isPending }}
        onPress={handleUnlock}
        className={cn('self-stretch', !canAfford && 'opacity-50')}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        className="min-h-11 items-center justify-center active:opacity-70"
      >
        <Text variant="label" className="text-muted">
          Not now
        </Text>
      </Pressable>
    </View>
  );
}
