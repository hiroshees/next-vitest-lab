import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserList, type User } from './UserList';

const users: User[] = [
  { id: 1, name: '山田' },
  { id: 2, name: '佐藤' },
];

describe('UserList', () => {
  it('取得中は「読み込み中…」が表示される', () => {
    // 終わらない Promise を返して、読み込み中の状態を保つ
    const fetchUsers = vi.fn(() => new Promise<User[]>(() => {}));
    render(<UserList fetchUsers={fetchUsers} />);

    expect(screen.getByRole('status')).toHaveTextContent('読み込み中…');
  });

  it('取得に成功すると、ユーザー名が一覧で表示され、読み込み中は消える', async () => {
    const fetchUsers = vi.fn<() => Promise<User[]>>().mockResolvedValue(users);
    render(<UserList fetchUsers={fetchUsers} />);

    const list = await screen.findByRole('list', { name: 'ユーザー一覧' });

    expect(list).toHaveTextContent('山田');
    expect(list).toHaveTextContent('佐藤');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(fetchUsers).toHaveBeenCalledTimes(1);
  });

  it('0件のときは「ユーザーがいません」と表示される', async () => {
    const fetchUsers = vi.fn<() => Promise<User[]>>().mockResolvedValue([]);
    render(<UserList fetchUsers={fetchUsers} />);

    expect(await screen.findByText('ユーザーがいません')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('取得に失敗すると、エラーと再試行ボタンが表示される', async () => {
    const fetchUsers = vi
      .fn<() => Promise<User[]>>()
      .mockRejectedValue(new Error('network error'));
    render(<UserList fetchUsers={fetchUsers} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '読み込みに失敗しました',
    );
    expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
  });

  it('再試行すると、もう一度取得して、成功すれば一覧が表示される', async () => {
    const user = userEvent.setup();
    const fetchUsers = vi
      .fn<() => Promise<User[]>>()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(users);
    render(<UserList fetchUsers={fetchUsers} />);

    await user.click(await screen.findByRole('button', { name: '再試行' }));

    expect(
      await screen.findByRole('list', { name: 'ユーザー一覧' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(fetchUsers).toHaveBeenCalledTimes(2);
  });

  it('（waitFor の例）取得関数が1回だけ呼ばれる', async () => {
    const fetchUsers = vi.fn<() => Promise<User[]>>().mockResolvedValue(users);
    render(<UserList fetchUsers={fetchUsers} />);

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(fetchUsers).toHaveBeenCalledTimes(1);
  });
});
