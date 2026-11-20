import { Suspense } from 'react';
import { ProductSearch } from '@/components/ProductSearch/ProductSearch';
import { ProductResults } from '@/features/products/ProductResults';

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
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SearchResults({ searchParams }: Props) {
  const { q } = await searchParams;
  const keyword = typeof q === 'string' ? q : '';
  return <ProductResults keyword={keyword} />;
}
