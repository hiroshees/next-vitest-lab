import { notFound } from 'next/navigation';
import { updateBookAction } from './actions';
import { BookForm } from './BookForm';
import { findBook } from './repository';

type Props = {
  params: Promise<{ id: string }>;
};

export async function EditBookContent({ params }: Props) {
  const { id } = await params;
  const book = findBook(id);

  if (!book) {
    notFound(); // 404画面を表示する（内部で例外を投げるので、ここで処理が止まる）
  }

  return (
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
  );
}
