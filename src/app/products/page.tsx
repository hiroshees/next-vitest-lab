// src/app/products/page.tsx
import { Suspense } from 'react';
import { ProductSearch } from '@/components/ProductSearch/ProductSearch';

export default function ProductsPage() {
  return (
    <main>
      <Suspense>
        <ProductSearch />
      </Suspense>
    </main>
  );
}
