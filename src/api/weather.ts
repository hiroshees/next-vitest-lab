export type Weather = { temperature: number; condition: string };
export type Weathers = { city: string; data: Weather }[];

export const API_BASE = 'https://api.example.com';

export class CityNotFoundError extends Error {
  constructor(city: string) {
    super(`City not found: ${city}`);
    this.name = 'CityNotFoundError';
  }
}

export async function getWeather(city: string): Promise<Weather> {
  const params = new URLSearchParams({ city });
  const res = await fetch(`${API_BASE}/weather?${params}`);

  if (res.status === 404) throw new CityNotFoundError(city);
  if (!res.ok) throw new Error(`Failed to fetch weather: ${res.status}`);

  return res.json();
}
