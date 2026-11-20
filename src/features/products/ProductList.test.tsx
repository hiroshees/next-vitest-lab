import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { Product } from '@/components/ProductCard/ProductCard';
import { ProductList } from './ProductList';

const products: Product[] = [
  { id: 1, name: '白いスニーカー', price: 12800, imageUrl: '/images/a.png' },
  { id: 2, name: '黒いブーツ', price: 24800, imageUrl: '/images/b.png' },
];

describe('ProductList', () => {
  it('商品が、渡した順に一覧で表示される', () => {
    render(<ProductList products={products} />);

    const list = screen.getByRole('list', { name: '商品一覧' });
    const names = within(list)
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent);
    expect(names).toEqual(['白いスニーカー', '黒いブーツ']);
  });

  it('0件でキーワードがあるときは、一致しない旨を表示する', () => {
    render(<ProductList products={[]} keyword="帽子" />);

    expect(
      screen.getByText('「帽子」に一致する商品はありません'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('0件でキーワードがないときは、商品がない旨を表示する', () => {
    render(<ProductList products={[]} />);

    expect(screen.getByText('商品はありません')).toBeInTheDocument();
  });
});
