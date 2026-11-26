import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EditBookContent } from '@/features/books/EditBookContent';

export const metadata: Metadata = { title: '書籍の編集' };

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditBookPage({ params }: Props) {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">書籍の編集</h1>
      <Suspense fallback={<p className="text-gray-600">読み込み中...</p>}>
        <EditBookContent params={params} />
      </Suspense>
    </main>
  );
}
