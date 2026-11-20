import { useEffect, useState } from 'react';
import { CityNotFoundError, getWeather, type Weather } from '../../api/weather';

type Props = {
  city: string;
  fetchWeather?: (city: string) => Promise<Weather>;
};

type State =
  | { status: 'loading' }
  | { status: 'success'; city: string; weather: Weather }
  | { status: 'error'; city: string; reason: 'not-found' | 'unknown' };

export function WeatherCard({ city, fetchWeather = getWeather }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchWeather(city)
      .then((weather) => {
        if (!ignore) setState({ status: 'success', city, weather });
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const reason =
            err instanceof CityNotFoundError ? 'not-found' : 'unknown';
          setState({ status: 'error', city, reason });
        }
      });
    return () => {
      ignore = true;
    };
  }, [fetchWeather, reloadKey, city]);

  function handleRetry() {
    setState({ status: 'loading' });
    setReloadKey((k) => k + 1);
  }

  const isForOtherCity = state.status !== 'loading' && state.city !== city;

  if (state.status === 'loading' || isForOtherCity) {
    return <p role="status">読み込み中…</p>;
  }

  if (state.status === 'error') {
    if (state.reason === 'not-found') {
      return <p role="alert">「{city}」の天気は見つかりませんでした</p>;
    }
    return (
      <div>
        <p role="alert">天気を取得できませんでした</p>
        <button type="button" onClick={handleRetry}>
          再試行
        </button>
      </div>
    );
  }

  return (
    <div>
      {city}:{state.weather.condition} {state.weather.temperature}℃
    </div>
  );
}
