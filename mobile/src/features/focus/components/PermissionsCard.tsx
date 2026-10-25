import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { FocusPermissions } from '@/features/focus/types';

export type PermissionsCardProps = {
  permissions: FocusPermissions;
  onOpenOverlay: () => void;
  onOpenUsageAccess: () => void;
  onRequestNotifications: () => void;
};

/** Lists only the permissions still missing; renders nothing once all are granted. */
export function PermissionsCard({
  permissions,
  onOpenOverlay,
  onOpenUsageAccess,
  onRequestNotifications,
}: PermissionsCardProps) {
  const { overlay, usageAccess, notifications } = permissions;
  if (overlay && usageAccess && notifications) return null;

  return (
    <Card className="gap-3 p-4">
      <Text variant="heading" accessibilityRole="header">
        Permissions needed
      </Text>
      <Text variant="caption">
        Android asks you to turn these on in its settings. Come back here when you&apos;re done.
      </Text>
      {overlay ? null : (
        <Button label="Allow display over apps" onPress={onOpenOverlay} className="self-stretch" />
      )}
      {usageAccess ? null : (
        <Button label="Allow usage access" onPress={onOpenUsageAccess} className="self-stretch" />
      )}
      {notifications ? null : (
        <Button
          label="Allow notifications (optional)"
          variant="soft"
          onPress={onRequestNotifications}
          className="self-stretch"
        />
      )}
    </Card>
  );
}
