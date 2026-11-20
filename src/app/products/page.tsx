import { Suspense } from 'react';
import { ProductSearch } from '@/components/ProductSearch/ProductSearch';
import { ProductList } from '@/features/products/ProductList';
import { findProducts } from '@/features/products/repository';

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default function ProductsPage({ searchParams }: Props) {
  return (
    <main>
      <h1>商品一覧</h1>
      <Suspense>
        <ProductSearch />
      </Suspense>
      <Suspense fallback={<p role="status">読み込み中…</p>}>
        <ProductResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function ProductResults({ searchParams }: Props) {
  await sleep(1000);
  const { q } = await searchParams;
  const keyword = typeof q === 'string' ? q : '';
  const products = await findProducts(keyword);

  return <ProductList products={products} keyword={keyword} />;
}
