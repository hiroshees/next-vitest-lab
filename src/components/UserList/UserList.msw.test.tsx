import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../../mocks/server';
import { API_BASE } from '../../api/users';
import { UserList } from './UserList';

describe('UserList（MSW）', () => {
  it('取得中は「読み込み中…」が表示される', async () => {
    server.use(
      http.get(`${API_BASE}/users`, async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    );
    render(<UserList />);

    expect(screen.getByRole('status')).toHaveTextContent('読み込み中…');
  });

  it('取得に成功すると、ユーザー名が一覧で表示される', async () => {
    render(<UserList />);

    const list = await screen.findByRole('list', { name: 'ユーザー一覧' });
    expect(list).toHaveTextContent('山田');
    expect(list).toHaveTextContent('佐藤');
  });

  it('0件のときは「ユーザーがいません」と表示される', async () => {
    server.use(http.get(`${API_BASE}/users`, () => HttpResponse.json([])));
    render(<UserList />);

    expect(await screen.findByText('ユーザーがいません')).toBeInTheDocument();
  });

  it('サーバーエラーのときは、エラーと再試行ボタンが表示される', async () => {
    server.use(
      http.get(
        `${API_BASE}/users`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    render(<UserList />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '読み込みに失敗しました',
    );
  });

  it('1回目が失敗しても、再試行で成功すれば一覧が表示される', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        `${API_BASE}/users`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );
    render(<UserList />);

    await user.click(await screen.findByRole('button', { name: '再試行' }));

    expect(
      await screen.findByRole('list', { name: 'ユーザー一覧' }),
    ).toBeInTheDocument();
  });
});
