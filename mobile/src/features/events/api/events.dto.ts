export type EventResponse = {
  id: string;
  title: string;
  startsAt: string;
  venue: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  organizer: string | null;
  isFree: boolean;
  registrationUrl: string | null;
};
