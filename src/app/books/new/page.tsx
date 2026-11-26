import type { Metadata } from 'next';
import { createBookAction } from '@/features/books/actions';
import { BookForm } from '@/features/books/BookForm';

export const metadata: Metadata = { title: '書籍の新規登録' };

export default function NewBookPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">書籍の新規登録</h1>
      <BookForm action={createBookAction} submitLabel="登録する" />
    </main>
  );
}
