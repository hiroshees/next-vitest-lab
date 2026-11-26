'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { insertBook, updateBook } from './repository';
import {
  type BookFormState,
  toBookFormValues,
  validateBook,
} from './validateBook';

export async function createBookAction(
  _prevState: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  const values = toBookFormValues(formData);
  const result = validateBook(values);

  if (!result.ok) {
    // 入力した値も返して、画面に残す
    return { status: 'error', errors: result.errors, values };
  }

  insertBook(result.data);
  revalidatePath('/books');
  // redirect は内部で例外を投げて画面を移動させる。try/catch の中に書かないこと
  redirect('/books?message=created');
}

/**
 * 編集画面で updateBookAction.bind(null, id) として、id を先に渡して使う。
 * ※ bind した値はブラウザを経由して送られてくるので、書き換えられる可能性がある。
 *   今回はログインがないので問題ないが、本番では「この人が更新してよい書籍か」を確認する
 */
export async function updateBookAction(
  id: string,
  _prevState: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  const values = toBookFormValues(formData);
  const result = validateBook(values);

  if (!result.ok) {
    return { status: 'error', errors: result.errors, values };
  }

  const updated = updateBook(id, result.data);
  if (!updated) {
    // 編集している間に、ほかの人が削除した場合など
    return {
      status: 'error',
      errors: { form: '対象の書籍が見つかりません' },
      values,
    };
  }

  revalidatePath('/books');
  redirect('/books?message=updated');
}
