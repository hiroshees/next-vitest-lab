import {
  ProductCard,
  type Product,
} from '@/components/ProductCard/ProductCard';

type Props = {
  products: Product[];
  keyword?: string;
};

export function ProductList({ products, keyword }: Props) {
  if (products.length === 0) {
    return (
      <p>
        {keyword
          ? `「${keyword}」に一致する商品はありません`
          : '商品はありません'}
      </p>
    );
  }

  return (
    <ul aria-label="商品一覧">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
