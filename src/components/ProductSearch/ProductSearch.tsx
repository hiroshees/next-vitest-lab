'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';

export function ProductSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
  const inputId = useId();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = keyword.trim();

    if (trimmed) {
      params.set('q', trimmed);
    } else {
      params.delete('q');
    }
    params.delete('page');

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <form role="search" onSubmit={handleSubmit}>
      <label htmlFor={inputId}>商品を検索</label>
      <input
        id={inputId}
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button type="submit">検索</button>
    </form>
  );
}
