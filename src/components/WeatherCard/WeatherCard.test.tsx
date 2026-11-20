import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeatherCard } from './WeatherCard';
import type { Weather } from '../../api/weather';

const mockWeathers: { city: string; data: Weather }[] = [
  { city: '東京', data: { temperature: 22, condition: '晴れ' } },
  { city: '大阪', data: { temperature: 10, condition: '雨' } },
  { city: '沖縄', data: { temperature: 30, condition: '晴れ' } },
];

describe('WeatherCard', () => {
  it.each(mockWeathers)(
    '$city の天気 $data.condition、$data.temperature℃ が正しく表示されること',
    async ({ city, data }) => {
      const fetchWeather = vi
        .fn<(_city: string) => Promise<Weather>>()
        .mockResolvedValue(data);

      render(<WeatherCard city={city} fetchWeather={fetchWeather} />);

      const expectedText = `${city}:${data.condition} ${data.temperature}℃`;
      expect(await screen.findByText(expectedText)).toBeInTheDocument();

      expect(fetchWeather).toHaveBeenCalledWith(city);
      expect(fetchWeather).toHaveBeenCalledTimes(1);
    },
  );

  it('引数で渡された都市cityに対応するモックデータを動的に返して表示できること', async () => {
    const fetchWeather = vi.fn(async (targetCity: string) => {
      const found = mockWeathers.find((w) => w.city === targetCity);
      if (!found) throw new Error('City not found');
      return found.data;
    });

    render(<WeatherCard city="大阪" fetchWeather={fetchWeather} />);

    // 大阪のデータ（雨、10℃）が正しく返って表示されるか
    expect(await screen.findByText('大阪:雨 10℃')).toBeInTheDocument();
    expect(fetchWeather).toHaveBeenCalledWith('大阪');
  });

  it('取得中は「読み込み中…」が表示されること', () => {
    const fetchWeather = vi.fn(() => new Promise<Weather>(() => {}));
    render(<WeatherCard city="東京" fetchWeather={fetchWeather} />);

    expect(screen.getByRole('status')).toHaveTextContent('読み込み中…');
    expect(fetchWeather).toHaveBeenCalledWith('東京');
  });

  it('取得に失敗したあと、再試行して成功すること', async () => {
    const user = userEvent.setup();
    const fetchWeather = vi
      .fn<(_city: string) => Promise<Weather>>()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(mockWeathers[0].data);

    render(<WeatherCard city="東京" fetchWeather={fetchWeather} />);

    const retryButton = await screen.findByRole('button', { name: '再試行' });
    await user.click(retryButton);

    expect(await screen.findByText('東京:晴れ 22℃')).toBeInTheDocument();
    expect(fetchWeather).toHaveBeenCalledTimes(2);
  });

  it('city が変わると読み込み中になり、新しい都市の天気が表示される', async () => {
    const osaka = Promise.withResolvers<Weather>();
    const fetchWeather = vi.fn((city: string) =>
      city === '東京'
        ? Promise.resolve({ temperature: 22, condition: '晴れ' })
        : osaka.promise,
    );
    const { rerender } = render(
      <WeatherCard city="東京" fetchWeather={fetchWeather} />,
    );
    expect(await screen.findByText('東京:晴れ 22℃')).toBeInTheDocument();

    rerender(<WeatherCard city="大阪" fetchWeather={fetchWeather} />);

    // 大阪の取得中：東京の天気が残っていないこと
    expect(screen.getByRole('status')).toHaveTextContent('読み込み中…');
    expect(screen.queryByText(/晴れ/)).not.toBeInTheDocument();
    expect(fetchWeather).toHaveBeenLastCalledWith('大阪');

    // 大阪の結果が返ってくる
    osaka.resolve({ temperature: 10, condition: '雨' });
    expect(await screen.findByText('大阪:雨 10℃')).toBeInTheDocument();
  });
});
