import { BookList } from './BookList';
import { FlashMessage } from './FlashMessage';
import { listBooks } from './repository';

type Props = {
  searchParams: Promise<{ message?: string | string[] }>;
};

function toMessage(key: string | string[] | undefined): string | undefined {
  switch (key) {
    case 'created':
      return '登録しました';
    case 'updated':
      return '更新しました';
    case 'deleted':
      return '削除しました';
    default:
      return undefined;
  }
}

export async function BooksContent({ searchParams }: Props) {
  // 先に searchParams を待つことで、このコンポーネントは「リクエストごとに描画する」扱いになる
  const { message } = await searchParams;
  const books = listBooks();

  return (
    <div className="space-y-4">
      <FlashMessage message={toMessage(message)} />
      <p className="text-sm text-gray-600">全{books.length}件</p>
      {books.length === 0 ? (
        <p className="py-8 text-center text-gray-600">
          書籍が登録されていません
        </p>
      ) : (
        <BookList books={books} />
      )}
    </div>
  );
}
