import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';

// NativeWind only maps className -> style on core RN components; third-party ones opt in here.
cssInterop(ExpoImage, { className: 'style' });

export type ImageProps = ExpoImageProps & { uri: string; className?: string };

export function Image({ uri, contentFit = 'cover', ...props }: ImageProps) {
  return (
    <ExpoImage
      source={{ uri }}
      contentFit={contentFit}
      transition={200}
      accessibilityIgnoresInvertColors
      {...props}
    />
  );
}
