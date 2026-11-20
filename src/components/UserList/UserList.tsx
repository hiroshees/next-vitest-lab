import { useEffect, useState } from 'react';
import { getUsers, type User } from '../../api/users';

type Props = {
  fetchUsers?: () => Promise<User[]>;
};

type State =
  | { status: 'loading' }
  | { status: 'success'; users: User[] }
  | { status: 'error' };

export function UserList({ fetchUsers = getUsers }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchUsers()
      .then((users) => {
        if (!ignore) setState({ status: 'success', users });
      })
      .catch(() => {
        if (!ignore) setState({ status: 'error' });
      });
    return () => {
      ignore = true;
    };
  }, [fetchUsers, reloadKey]);

  function handleRetry() {
    setState({ status: 'loading' });
    setReloadKey((k) => k + 1);
  }

  if (state.status === 'loading') {
    return <p role="status">読み込み中…</p>;
  }

  if (state.status === 'error') {
    return (
      <div>
        <p role="alert">読み込みに失敗しました</p>
        <button type="button" onClick={handleRetry}>
          再試行
        </button>
      </div>
    );
  }

  if (state.users.length === 0) {
    return <p>ユーザーがいません</p>;
  }

  return (
    <ul aria-label="ユーザー一覧">
      {state.users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
