import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ProductCard,
  type Product,
} from '@/components/ProductCard/ProductCard';

const product: Product = {
  id: 1,
  name: '白いスニーカー',
  price: 12800,
  imageUrl: '/images/sneaker.png',
};

describe('ProductCard', () => {
  it('商品名が、詳細ページへのリンク付きの見出しとして表示される', () => {
    render(<ProductCard product={product} />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: '白いスニーカー',
    });
    expect(heading).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '白いスニーカー' }),
    ).toHaveAttribute('href', '/products/1');
  });

  it('商品画像が、商品名を代替テキストとして表示される', () => {
    render(<ProductCard product={product} />);

    expect(
      screen.getByRole('img', { name: '白いスニーカー' }),
    ).toBeInTheDocument();
  });

  it('価格が3桁区切りで表示される', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByText('12,800円')).toBeInTheDocument();
  });
});
