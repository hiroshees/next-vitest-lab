export const GENRES = ['技術書', 'ビジネス', 'デザイン', 'その他'] as const;
export type Genre = (typeof GENRES)[number];

/** フォームから受け取る値（すべて文字列のまま） */
export type BookFormValues = {
  title: string;
  author: string;
  genre: string;
  publishedYear: string;
  memo: string;
};

/** チェックを通ったあとの値 */
export type BookData = {
  title: string;
  author: string;
  genre: Genre;
  publishedYear: number;
  memo: string;
};

/** 保存されている書籍 */
export type Book = BookData & { id: string };

/** 項目ごとのエラー（form は画面全体のエラー） */
export type BookErrors = Partial<Record<keyof BookFormValues | 'form', string>>;

/** フォームの状態（成功時は一覧へ移動するので success は持たない） */
export type BookFormState =
  | { status: 'idle' }
  | { status: 'error'; errors: BookErrors; values: BookFormValues };
