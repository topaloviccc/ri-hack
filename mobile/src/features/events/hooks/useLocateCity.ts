import * as Location from 'expo-location';
import { useState } from 'react';

type LocateStatus = 'idle' | 'locating' | 'denied' | 'failed';

/** Resolves the device's current city via GPS + reverse geocoding. */
export function useLocateCity(onCity: (city: string) => void) {
  const [status, setStatus] = useState<LocateStatus>('idle');

  const locate = async () => {
    setStatus('locating');
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setStatus('denied');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync(coords);
      const city = place?.city ?? place?.subregion;
      if (!city) {
        setStatus('failed');
        return;
      }
      onCity(city);
      setStatus('idle');
    } catch {
      setStatus('failed');
    }
  };

  return { locate, status };
}
