// Expo inlines only direct process.env.EXPO_PUBLIC_* property reads.
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, ''),
};
