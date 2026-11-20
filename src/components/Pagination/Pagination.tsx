'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { createPageHref, parseCurrentPage } from './pageUtils';

type Props = {
  totalPages: number;
};

export function Pagination({ totalPages }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 0) {
    return null;
  }

  const query = searchParams.toString();
  const currentPage = parseCurrentPage(searchParams.get('page'), totalPages);
  const hrefFor = (page: number) => createPageHref(pathname, query, page);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="ページネーション">
      <ul>
        {currentPage > 1 && (
          <li>
            <Link href={hrefFor(currentPage - 1)}>前へ</Link>
          </li>
        )}

        {pages.map((page) => (
          <li key={page}>
            <Link
              href={hrefFor(page)}
              aria-label={`${page}ページ目`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          </li>
        ))}

        {currentPage < totalPages && (
          <li>
            <Link href={hrefFor(currentPage + 1)}>次へ</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
