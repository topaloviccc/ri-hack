const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - 'A'.charCodeAt(0);

/** 'ME' -> 🇲🇪 */
export const countryFlag = (countryCode: string) =>
  String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((c) => c.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET),
  );
