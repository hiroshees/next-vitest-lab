// @vitest-environment node
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import { createBookAction, updateBookAction } from './actions';
import { insertBook, updateBook } from './repository';
import type { BookFormState, BookFormValues } from './validateBook';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
vi.mock('./repository', () => ({ insertBook: vi.fn(), updateBook: vi.fn() })); // ← updateBook を追加

const idle: BookFormState = { status: 'idle' };

function makeFormData(values: BookFormValues) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

const validValues: BookFormValues = {
  title: '  テスト駆動入門  ',
  author: '高橋次郎',
  genre: '技術書',
  publishedYear: '2020',
  memo: '',
};

describe('createBookAction', () => {
  it('BOOK-N01 正しい値なら保存し、一覧を更新して「登録しました」付きで一覧へ移動する', async () => {
    await expect(
      createBookAction(idle, makeFormData(validValues)),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(insertBook).toHaveBeenCalledWith({
      title: 'テスト駆動入門',
      author: '高橋次郎',
      genre: '技術書',
      publishedYear: 2020,
      memo: '',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/books');
    expect(redirect).toHaveBeenCalledWith('/books?message=created');
  });

  it('BOOK-N02 NGなら、エラーと入力した値を返し、保存も移動もしない', async () => {
    const values = { ...validValues, title: '', publishedYear: 'abc' };

    const state = await createBookAction(idle, makeFormData(values));

    expect(state).toEqual({
      status: 'error',
      errors: {
        title: 'タイトルを入力してください',
        publishedYear: '出版年は整数で入力してください',
      },
      values,
    });
    expect(insertBook).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('updateBookAction', () => {
  it('BOOK-E02 正しい値なら更新し、一覧を更新して「更新しました」付きで一覧へ移動する', async () => {
    vi.mocked(updateBook).mockReturnValue({
      id: '2',
      title: 'テスト駆動入門',
      author: '高橋次郎',
      genre: '技術書',
      publishedYear: 2020,
      memo: '',
    });

    await expect(
      updateBookAction('2', idle, makeFormData(validValues)),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(updateBook).toHaveBeenCalledWith('2', {
      title: 'テスト駆動入門',
      author: '高橋次郎',
      genre: '技術書',
      publishedYear: 2020,
      memo: '',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/books');
    expect(redirect).toHaveBeenCalledWith('/books?message=updated');
  });

  it('BOOK-E03 NGなら、エラーと入力した値を返し、更新も移動もしない', async () => {
    const values = { ...validValues, author: '' };

    const state = await updateBookAction('2', idle, makeFormData(values));

    expect(state).toEqual({
      status: 'error',
      errors: { author: '著者を入力してください' },
      values,
    });
    expect(updateBook).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('BOOK-E04 対象の書籍がなければ「対象の書籍が見つかりません」を返し、移動しない', async () => {
    vi.mocked(updateBook).mockReturnValue(undefined);

    const state = await updateBookAction(
      '999',
      idle,
      makeFormData(validValues),
    );

    expect(state).toEqual({
      status: 'error',
      errors: { form: '対象の書籍が見つかりません' },
      values: validValues,
    });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
