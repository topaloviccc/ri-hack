import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

export type NfcModule = typeof import('react-native-nfc-manager');

/**
 * Loads react-native-nfc-manager only when its native code is in the build. The package throws on
 * import otherwise, which would crash Expo Go and Jest, where NFC simply isn't available.
 */
export async function loadNfcModule(): Promise<NfcModule | null> {
  // TODO(hack): Android only. iOS needs the NFC entitlement and a user-started scan session.
  if (Platform.OS !== 'android') return null;
  const isLinked = !!(TurboModuleRegistry.get('NfcManager') ?? NativeModules.NfcManager);
  return isLinked ? import('react-native-nfc-manager') : null;
}
