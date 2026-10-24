import { Linking, Platform } from 'react-native';

/** Opens the platform's native maps app with a pin. */
export const openInMaps = (lat: number, lng: number, label: string) => {
  const q = encodeURIComponent(label);
  const url = Platform.select({
    ios: `maps:0,0?q=${q}@${lat},${lng}`,
    default: `geo:0,0?q=${lat},${lng}(${q})`,
  });
  return Linking.openURL(url);
};
