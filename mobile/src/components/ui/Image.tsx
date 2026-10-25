import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';
import { View } from 'react-native';

// NativeWind only maps className -> style on core RN components; third-party ones opt in here.
cssInterop(ExpoImage, { className: 'style' });

export type ImageProps = ExpoImageProps & {
  /** Missing images render the same box empty, so give it a background class (e.g. bg-border). */
  uri: string | null | undefined;
  className?: string;
};

export function Image({ uri, contentFit = 'cover', className, ...props }: ImageProps) {
  if (!uri) return <View className={className} accessibilityElementsHidden />;
  return (
    <ExpoImage
      source={{ uri }}
      contentFit={contentFit}
      transition={200}
      accessibilityIgnoresInvertColors
      className={className}
      {...props}
    />
  );
}
