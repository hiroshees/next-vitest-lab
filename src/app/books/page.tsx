import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { BooksContent } from '@/features/books/BooksContent';

export const metadata: Metadata = { title: '書籍一覧' };

type Props = {
  searchParams: Promise<{ message?: string | string[] }>;
};

export default function BooksPage({ searchParams }: Props) {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">書籍一覧</h1>
        <Link
          href="/books/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          新規登録
        </Link>
      </div>
      <Suspense fallback={<p className="text-gray-600">読み込み中...</p>}>
        <BooksContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
