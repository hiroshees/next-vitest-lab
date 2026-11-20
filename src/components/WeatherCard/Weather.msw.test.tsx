import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../../mocks/server';
import { API_BASE } from '../../api/weather';
import { weathers } from '../../mocks/handlers';
import { WeatherCard } from './WeatherCard';

describe('WeatherCard(MSW)', () => {
  it('取得中は「読み込み中…」が表示される', async () => {
    server.use(
      http.get(`${API_BASE}/weather`, async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    );
    render(<WeatherCard city="東京" />);

    expect(screen.getByRole('status')).toHaveTextContent('読み込み中…');
  });

  it.each(weathers)(
    '$city の天気 $data.condition、$data.temperature℃ が正しく表示されること',
    async ({ city, data }) => {
      render(<WeatherCard city={city} />);

      const expectedText = `${city}:${data.condition} ${data.temperature}℃`;
      expect(await screen.findByText(expectedText)).toBeInTheDocument();
    },
  );

  it('存在しない都市のときは、見つからない旨を表示し、再試行ボタンは出さない', async () => {
    render(<WeatherCard city="福岡" />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '「福岡」の天気は見つかりませんでした',
    );
    expect(
      screen.queryByRole('button', { name: '再試行' }),
    ).not.toBeInTheDocument();
  });

  it('サーバーエラーのときは、エラーと再試行ボタンが表示される', async () => {
    server.use(
      http.get(
        `${API_BASE}/weather`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    render(<WeatherCard city="東京" />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '天気を取得できませんでした',
    );
    expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
  });

  it('1回目が失敗しても、再試行で成功すれば一覧が表示される', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        `${API_BASE}/weather`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );
    render(<WeatherCard city="東京" />);

    await user.click(await screen.findByRole('button', { name: '再試行' }));

    const expectedText = '東京:晴れ 22℃';
    expect(await screen.findByText(expectedText)).toBeInTheDocument();
  });
});
