'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { insertBook } from './repository';
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
