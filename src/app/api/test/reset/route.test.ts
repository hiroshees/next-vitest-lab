// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { insertBook, listBooks, resetBooks } from '@/features/books/repository';
import { POST } from './route';

const newBook = {
  title: 'テスト駆動入門',
  author: '高橋次郎',
  genre: '技術書',
  publishedYear: 2024,
  memo: '',
} as const;

beforeEach(() => {
  resetBooks();
  insertBook(newBook); // 4件にしておく
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/test/reset', () => {
  it('E2E=1 のときは初期データ3件に戻す', async () => {
    vi.stubEnv('E2E', '1');

    const res = await POST();

    expect(res.status).toBe(200);
    expect(listBooks()).toHaveLength(3);
  });

  it('E2E が未設定なら404を返し、データは変わらない', async () => {
    vi.stubEnv('E2E', undefined);

    const res = await POST();

    expect(res.status).toBe(404);
    expect(listBooks()).toHaveLength(4);
  });
});
