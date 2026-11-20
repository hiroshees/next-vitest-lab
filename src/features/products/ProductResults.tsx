import { ProductList } from './ProductList';
import { findProducts } from './repository';

type Props = {
  keyword: string;
};

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function ProductResults({ keyword }: Props) {
  // await sleep(500);
  const products = await findProducts(keyword);
  return <ProductList products={products} keyword={keyword} />;
}
