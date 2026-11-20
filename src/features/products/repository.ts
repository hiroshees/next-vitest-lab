import type { Product } from '@/components/ProductCard/ProductCard';

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: '白いスニーカー',
    price: 12800,
    imageUrl: '/images/sneaker-white.png',
  },
  {
    id: 2,
    name: '黒いブーツ',
    price: 24800,
    imageUrl: '/images/boots-black.png',
  },
  {
    id: 3,
    name: '赤いスニーカー',
    price: 9800,
    imageUrl: '/images/sneaker-red.png',
  },
];

export async function findProducts(keyword = ''): Promise<Product[]> {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return PRODUCTS;
  }
  return PRODUCTS.filter((product) => product.name.includes(trimmed));
}
