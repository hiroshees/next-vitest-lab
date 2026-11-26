import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BookForm } from './BookForm';
import type { BookFormState } from './validateBook';

type Action = ComponentProps<typeof BookForm>['action'];

const idleAction = () => vi.fn<Action>(async () => ({ status: 'idle' }));

const fields = () => ({
  title: screen.getByRole('textbox', { name: 'タイトル' }),
  author: screen.getByRole('textbox', { name: '著者' }),
  genre: screen.getByRole('combobox', { name: 'ジャンル' }),
  publishedYear: screen.getByRole('textbox', { name: '出版年' }),
  memo: screen.getByRole('textbox', { name: 'メモ' }),
});

describe('BookForm', () => {
  it('新規登録では、すべて空で表示され、ボタンは「登録する」', () => {
    render(<BookForm action={idleAction()} submitLabel="登録する" />);

    const f = fields();
    expect(f.title).toHaveValue('');
    expect(f.genre).toHaveValue('');
    expect(screen.getByRole('button', { name: '登録する' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'キャンセル' })).toHaveAttribute(
      'href',
      '/books',
    );
  });

  it('BOOK-E01 初期値を渡すと、その値が入った状態で表示される', () => {
    render(
      <BookForm
        action={idleAction()}
        submitLabel="更新する"
        initialValues={{
          title: 'チームで進める仕事術',
          author: '佐藤花子',
          genre: 'ビジネス',
          publishedYear: '2021',
          memo: '読書会で使用',
        }}
      />,
    );

    const f = fields();
    expect(f.title).toHaveValue('チームで進める仕事術');
    expect(f.author).toHaveValue('佐藤花子');
    expect(f.genre).toHaveValue('ビジネス');
    expect(f.publishedYear).toHaveValue('2021');
    expect(f.memo).toHaveValue('読書会で使用');
    expect(
      screen.getByRole('button', { name: '更新する' }),
    ).toBeInTheDocument();
  });

  it('入力した値が FormData として action に渡される', async () => {
    const user = userEvent.setup();
    const action = idleAction();
    render(<BookForm action={action} submitLabel="登録する" />);

    const f = fields();
    await user.type(f.title, 'テスト駆動入門');
    await user.selectOptions(f.genre, '技術書');
    await user.type(f.publishedYear, '2020');
    await user.click(screen.getByRole('button', { name: '登録する' }));

    expect(action).toHaveBeenCalledTimes(1);
    const formData = action.mock.calls[0][1];
    expect(formData.get('title')).toBe('テスト駆動入門');
    expect(formData.get('genre')).toBe('技術書');
    expect(formData.get('publishedYear')).toBe('2020');
  });

  it('BOOK-N02 BOOK-N03 エラーが返ると、項目の下にエラーを表示し、入力した値が残る', async () => {
    const user = userEvent.setup();
    const errorState: BookFormState = {
      status: 'error',
      errors: {
        title: 'タイトルを入力してください',
        publishedYear: '出版年は整数で入力してください',
      },
      values: {
        title: '',
        author: '山田太郎',
        genre: '技術書',
        publishedYear: 'abc',
        memo: 'メモ',
      },
    };
    const action = vi.fn<Action>(async () => errorState);
    render(<BookForm action={action} submitLabel="登録する" />);

    await user.click(screen.getByRole('button', { name: '登録する' }));

    const f = fields();
    // エラーの項目：aria-invalid が付き、エラー文が説明として結び付いている
    expect(
      await screen.findByText('タイトルを入力してください'),
    ).toBeInTheDocument();
    expect(f.title).toHaveAttribute('aria-invalid', 'true');
    expect(f.title).toHaveAccessibleDescription('タイトルを入力してください');
    expect(f.publishedYear).toHaveAccessibleDescription(
      '出版年は整数で入力してください',
    );

    // エラーでない項目：aria-invalid は付かない
    expect(f.author).not.toHaveAttribute('aria-invalid');

    // 入力した値が残る（select も含む）
    expect(f.author).toHaveValue('山田太郎');
    expect(f.genre).toHaveValue('技術書');
    expect(f.publishedYear).toHaveValue('abc');
    expect(f.memo).toHaveValue('メモ');
  });

  it('画面全体のエラー（form）は、フォームの上に alert で表示される', async () => {
    const user = userEvent.setup();
    const action = vi.fn<Action>(async () => ({
      status: 'error',
      errors: { form: '対象の書籍が見つかりません' },
      values: {
        title: 'a',
        author: 'b',
        genre: '技術書',
        publishedYear: '2020',
        memo: '',
      },
    }));
    render(<BookForm action={action} submitLabel="更新する" />);

    await user.click(screen.getByRole('button', { name: '更新する' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '対象の書籍が見つかりません',
    );
  });

  it('BOOK-N04 送信中はボタンが押せない', async () => {
    const user = userEvent.setup();
    const { promise, resolve } = Promise.withResolvers<BookFormState>();
    const action = vi.fn<Action>(() => promise);
    render(<BookForm action={action} submitLabel="登録する" />);

    await user.click(screen.getByRole('button', { name: '登録する' }));

    expect(
      await screen.findByRole('button', { name: '登録する' }),
    ).toBeDisabled();

    // 後片付け：終わらない処理を残すと、同じファイルの次のテストに影響する
    await act(async () => {
      resolve({ status: 'idle' });
    });
  });
});
