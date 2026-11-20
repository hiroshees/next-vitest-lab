import Image from 'next/image';
import Link from 'next/link';

export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
};

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  return (
    <article>
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={160}
        height={160}
      />
      <h2>
        <Link href={`/products/${product.id}`}>{product.name}</Link>
      </h2>
      <p>{product.price.toLocaleString('ja-JP')}円</p>
    </article>
  );
}
