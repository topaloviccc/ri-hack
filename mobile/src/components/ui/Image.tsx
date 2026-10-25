import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

// NativeWind only maps className -> style on core RN components; third-party ones opt in here.
cssInterop(ExpoImage, { className: 'style' });

export type ImageProps = ExpoImageProps & {
  /** Missing images render the same box empty, on the border-colored placeholder. */
  uri: string | null | undefined;
  className?: string;
};

export function Image({ uri, contentFit = 'cover', className, ...props }: ImageProps) {
  const boxClassName = cn('bg-border', className);
  if (!uri) return <View className={boxClassName} accessibilityElementsHidden />;
  return (
    <ExpoImage
      source={{ uri }}
      contentFit={contentFit}
      transition={200}
      accessibilityIgnoresInvertColors
      className={boxClassName}
      {...props}
    />
  );
}
