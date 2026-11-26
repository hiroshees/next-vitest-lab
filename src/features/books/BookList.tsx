'use client';

import Link from 'next/link';
import type { Book } from './validateBook';

type Props = { books: Book[] };

const th = 'border-b border-gray-300 px-3 py-2 font-semibold';
const td = 'border-b border-gray-200 px-3 py-2';

export function BookList({ books }: Props) {
  return (
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
              <Link
                href={`/books/${book.id}/edit`}
                className="text-blue-700 underline hover:text-blue-900"
              >
                編集
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
