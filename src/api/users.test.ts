import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { users } from '../mocks/handlers';
import { API_BASE, getUsers } from './users';

describe('getUsers', () => {
  it('成功するとユーザーの配列を返す', async () => {
    await expect(getUsers()).resolves.toEqual(users);
  });

  it('サーバーが500を返すとエラーになる', async () => {
    server.use(
      http.get(`${API_BASE}/users`, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    await expect(getUsers()).rejects.toThrow('Failed to fetch users: 500');
  });

  it('通信そのものが失敗するとエラーになる', async () => {
    server.use(
      http.get(`${API_BASE}/users`, () => {
        return HttpResponse.error();
      }),
    );

    await expect(getUsers()).rejects.toThrow();
  });
});
