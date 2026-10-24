export function hasCoordinates<T extends { lat: number | null; lng: number | null }>(
  item: T,
): item is T & { lat: number; lng: number } {
  return item.lat !== null && item.lng !== null;
}
