import type { Book, BookData } from './validateBook';

const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: '配色の基本',
    author: '鈴木一郎',
    genre: 'デザイン',
    publishedYear: 2019,
    memo: '',
  },
  {
    id: '2',
    title: 'チームで進める仕事術',
    author: '佐藤花子',
    genre: 'ビジネス',
    publishedYear: 2021,
    memo: '読書会で使用',
  },
  {
    id: '3',
    title: 'はじめてのTypeScript',
    author: '山田太郎',
    genre: '技術書',
    publishedYear: 2023,
    memo: '',
  },
];

type Store = { books: Book[]; nextId: number };

// 開発サーバーはファイル保存のたびにモジュールを読み直す（HMR）ので、
// ふつうの変数だとデータが消える。globalThis に置いて残す。
const globalForBooks = globalThis as typeof globalThis & {
  __booksStore?: Store;
};

function createInitialStore(): Store {
  return {
    books: INITIAL_BOOKS.map((book) => ({ ...book })),
    nextId: INITIAL_BOOKS.length + 1,
  };
}

function getStore(): Store {
  globalForBooks.__booksStore ??= createInitialStore();
  return globalForBooks.__booksStore;
}

/** 新しい順（idの大きい順）で返す。呼び出し側が書き換えても影響しないようコピーを返す */
export function listBooks(): Book[] {
  return getStore()
    .books.map((book) => ({ ...book }))
    .sort((a, b) => Number(b.id) - Number(a.id));
}

export function findBook(id: string): Book | undefined {
  const book = getStore().books.find((b) => b.id === id);
  return book ? { ...book } : undefined;
}

export function insertBook(data: BookData): Book {
  const store = getStore();
  const book: Book = { id: String(store.nextId), ...data };
  store.nextId += 1;
  store.books.push(book);
  return { ...book };
}

export function updateBook(id: string, data: BookData): Book | undefined {
  const store = getStore();
  const index = store.books.findIndex((b) => b.id === id);
  if (index === -1) return undefined;
  store.books[index] = { id, ...data };
  return { ...store.books[index] };
}

export function deleteBook(id: string): boolean {
  const store = getStore();
  const before = store.books.length;
  store.books = store.books.filter((b) => b.id !== id);
  return store.books.length < before;
}

/** 初期データ3件に戻す（テスト用） */
export function resetBooks(): void {
  globalForBooks.__booksStore = createInitialStore();
}
