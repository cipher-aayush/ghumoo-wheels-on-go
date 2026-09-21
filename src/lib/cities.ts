export type CityPoint = { city: string; lat: number; lng: number };

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  "Delhi NCR": { lat: 28.6139, lng: 77.209 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Goa: { lat: 15.2993, lng: 74.124 },
};

export function cityPoint(city: string): { lat: number; lng: number } | null {
  return CITY_COORDS[city] ?? null;
}
