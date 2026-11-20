// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { GET } from './route';

function get(query = '') {
  return GET(new Request(`http://localhost/api/products${query}`));
}

describe('GET /api/products', () => {
  it('キーワードがなければ、すべての商品を返す', async () => {
    const response = await get();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.products).toHaveLength(3);
  });

  it('キーワードで絞り込んだ商品を返す', async () => {
    const response = await get(`?${new URLSearchParams({ q: 'スニーカー' })}`);

    const body = await response.json();
    expect(body.products.map((p: { name: string }) => p.name)).toEqual([
      '白いスニーカー',
      '赤いスニーカー',
    ]);
  });

  it('キーワードが50文字を超えると、400とエラーメッセージを返す', async () => {
    const response = await get(`?q=${'a'.repeat(51)}`);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'キーワードは50文字以内で指定してください',
    });
  });

  it('キーワードがちょうど50文字なら、エラーにならない', async () => {
    const response = await get(`?q=${'a'.repeat(50)}`);

    expect(response.status).toBe(200);
  });
});
