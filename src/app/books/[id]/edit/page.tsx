import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { updateBookAction } from '@/features/books/actions';
import { BookForm } from '@/features/books/BookForm';
import { findBook } from '@/features/books/repository';

export const metadata: Metadata = { title: '書籍の編集' };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBookPage({ params }: Props) {
  const { id } = await params;
  const book = findBook(id);

  if (!book) {
    notFound(); // 404画面を表示する（内部で例外を投げるので、ここで処理が止まる）
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">書籍の編集</h1>
      <BookForm
        action={updateBookAction.bind(null, id)}
        submitLabel="更新する"
        initialValues={{
          title: book.title,
          author: book.author,
          genre: book.genre,
          publishedYear: String(book.publishedYear), // フォームでは文字列として扱う
          memo: book.memo,
        }}
      />
    </main>
  );
}
