'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import type { DeleteBookResult } from './actions';
import { DeleteBookDialog } from './DeleteBookDialog';
import type { Book } from './validateBook';

type Props = {
  books: Book[];
  /** 削除の処理。テストや Storybook では偽物を渡す */
  deleteAction: (id: string) => Promise<DeleteBookResult>;
};

const th = 'border-b border-gray-300 px-3 py-2 font-semibold';
const td = 'border-b border-gray-200 px-3 py-2';

export function BookList({ books, deleteAction }: Props) {
  const router = useRouter();
  const [target, setTarget] = useState<Book | null>(null);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  // 押した「削除」ボタン（モーダルを閉じたあと、ここにフォーカスを戻す）
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  function openDialog(book: Book, button: HTMLButtonElement) {
    triggerRef.current = button;
    setError(undefined);
    setTarget(book);
  }

  function closeDialog() {
    setTarget(null);
    setError(undefined);
    triggerRef.current?.focus();
  }

  function confirmDelete() {
    if (!target) return;
    const id = target.id;

    startTransition(async () => {
      const result = await deleteAction(id);
      if (result.ok) {
        setTarget(null);
        router.replace('/books?message=deleted');
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <>
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">書籍一覧</caption>
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className={th}>
              タイトル
            </th>
            <th scope="col" className={th}>
              著者
            </th>
            <th scope="col" className={th}>
              ジャンル
            </th>
            <th scope="col" className={th}>
              出版年
            </th>
            <th scope="col" className={th}>
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id} className="hover:bg-gray-50">
              <td className={td}>{book.title}</td>
              <td className={td}>{book.author}</td>
              <td className={td}>{book.genre}</td>
              <td className={td}>{book.publishedYear}</td>
              <td className={td}>
                <div className="flex gap-3">
                  <Link
                    href={`/books/${book.id}/edit`}
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    編集
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => openDialog(book, event.currentTarget)}
                    className="text-red-700 underline hover:text-red-900"
                  >
                    削除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DeleteBookDialog
        book={target}
        pending={isPending}
        error={error}
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      />
    </>
  );
}
