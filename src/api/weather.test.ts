import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { weathers } from '../mocks/handlers';
import { API_BASE, CityNotFoundError, getWeather } from './weather';

describe('getWeather', () => {
  it('成功すると天気を返す', async () => {
    await expect(getWeather('東京')).resolves.toEqual(
      weathers.find((item) => item.city === '東京')?.data,
    );
  });

  it('大阪を指定すると大阪の天気を返す', async () => {
    await expect(getWeather('大阪')).resolves.toEqual(
      weathers.find((item) => item.city === '大阪')?.data,
    );
  });

  // it('福岡を指定すると404になり、都市が見つからないエラーになる', async () => {
  //   await expect(getWeather('福岡')).rejects.toThrow('都市が見つかりません');
  // });
  it('存在しない都市を指定すると、CityNotFoundError になる', async () => {
    await expect(getWeather('福岡')).rejects.toBeInstanceOf(CityNotFoundError);
  });

  it('サーバーが500を返すとエラーになる', async () => {
    server.use(
      http.get(`${API_BASE}/weather`, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    await expect(getWeather('東京')).rejects.toThrow(
      'Failed to fetch weather: 500',
    );
  });

  it('通信そのものが失敗するとエラーになる', async () => {
    server.use(
      http.get(`${API_BASE}/weather`, () => {
        return HttpResponse.error();
      }),
    );

    await expect(getWeather('東京')).rejects.toThrow();
  });
});
