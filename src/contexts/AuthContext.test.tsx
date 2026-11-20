import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth', () => {
  it('login するとユーザーが入り、logout すると空に戻る', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();

    act(() => {
      result.current.login({ id: 1, name: '山田' });
    });
    expect(result.current.user).toEqual({ id: 1, name: '山田' });

    act(() => {
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
  });

  it('AuthProvider の外で使うとエラーになる', () => {
    // React が出すエラーログを、このテストの間だけ表示しないようにする
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth は AuthProvider の中で使ってください',
    );

    consoleError.mockRestore();
  });
});
