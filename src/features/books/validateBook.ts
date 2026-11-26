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

const TITLE_MAX = 100;
const AUTHOR_MAX = 50;
const MEMO_MAX = 500;
const YEAR_MIN = 1900;

function isGenre(value: string): value is Genre {
  return (GENRES as readonly string[]).includes(value);
}

/** FormData から、フォームの値（すべて文字列）を取り出す。項目がなければ空文字 */
export function toBookFormValues(formData: FormData): BookFormValues {
  const get = (name: keyof BookFormValues) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value : '';
  };
  return {
    title: get('title'),
    author: get('author'),
    genre: get('genre'),
    publishedYear: get('publishedYear'),
    memo: get('memo'),
  };
}

/**
 * 書籍の入力値をチェックする。
 * currentYear はテストで年を固定できるよう引数にしている。
 */
export function validateBook(
  values: BookFormValues,
  currentYear: number = new Date().getFullYear(),
): { ok: true; data: BookData } | { ok: false; errors: BookErrors } {
  const title = values.title.trim();
  const author = values.author.trim();
  const genre = values.genre.trim();
  const yearText = values.publishedYear.trim();
  const memo = values.memo.trim();

  const errors: BookErrors = {};

  if (!title) {
    errors.title = 'タイトルを入力してください';
  } else if (title.length > TITLE_MAX) {
    errors.title = `タイトルは${TITLE_MAX}文字以内で入力してください`;
  }

  if (!author) {
    errors.author = '著者を入力してください';
  } else if (author.length > AUTHOR_MAX) {
    errors.author = `著者は${AUTHOR_MAX}文字以内で入力してください`;
  }

  if (!genre) {
    errors.genre = 'ジャンルを選択してください';
  } else if (!isGenre(genre)) {
    errors.genre = 'ジャンルの値が正しくありません';
  }

  if (!yearText) {
    errors.publishedYear = '出版年を入力してください';
  } else if (!/^-?\d+$/.test(yearText)) {
    errors.publishedYear = '出版年は整数で入力してください';
  } else {
    const year = Number(yearText);
    if (year < YEAR_MIN || year > currentYear) {
      errors.publishedYear = `出版年は${YEAR_MIN}年から今年までで入力してください`;
    }
  }

  if (memo.length > MEMO_MAX) {
    errors.memo = `メモは${MEMO_MAX}文字以内で入力してください`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    // ここに来るときは isGenre のチェックを通っている
    data: {
      title,
      author,
      genre: genre as Genre,
      publishedYear: Number(yearText),
      memo,
    },
  };
}
