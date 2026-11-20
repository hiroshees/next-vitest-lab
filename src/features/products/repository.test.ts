import { describe, it, expect } from 'vitest';
import { findProducts } from './repository';

describe('findProducts', () => {
  it('キーワードがなければ、すべての商品を返す', async () => {
    expect(await findProducts()).toHaveLength(3);
  });

  it('キーワードを含む商品だけを返す', async () => {
    const products = await findProducts('スニーカー');

    expect(products.map((p) => p.name)).toEqual([
      '白いスニーカー',
      '赤いスニーカー',
    ]);
  });

  it('前後の空白は無視する', async () => {
    const products = await findProducts('  ブーツ  ');

    expect(products.map((p) => p.name)).toEqual(['黒いブーツ']);
  });

  it('一致する商品がなければ、空の配列を返す', async () => {
    expect(await findProducts('帽子')).toEqual([]);
  });
});
