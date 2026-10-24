import { View } from 'react-native';

import { Image } from '@/components/ui/Image';
import { cn } from '@/lib/cn';

const SIZES = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
} as const;

export type AvatarProps = {
  /** Omit while loading to show a blank circle. */
  uri?: string;
  size?: keyof typeof SIZES;
  className?: string;
};

export function Avatar({ uri, size = 'sm', className }: AvatarProps) {
  const classes = cn('rounded-full border-2 border-surface bg-border', SIZES[size], className);
  if (!uri) return <View className={classes} />;
  return <Image uri={uri} className={classes} />;
}
