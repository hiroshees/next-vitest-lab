import { useAuth } from '../../contexts/AuthContext';

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) {
    return <a href="/login">ログイン</a>;
  }

  return (
    <div>
      <span>{user.name}さん</span>
      <button type="button" onClick={logout}>
        ログアウト
      </button>
    </div>
  );
}
