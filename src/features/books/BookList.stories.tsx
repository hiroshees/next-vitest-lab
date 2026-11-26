import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { expect, fn, within } from 'storybook/test';
import { sampleBooks } from '@/test/fixtures/books';
import type { DeleteBookResult } from './actions';
import { BookList } from './BookList';

const meta = {
  component: BookList,
  args: {
    books: sampleBooks,
    deleteAction: fn(async (): Promise<DeleteBookResult> => ({ ok: true })),
  },
} satisfies Meta<typeof BookList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('row')).toHaveLength(4);
    await expect(canvas.getAllByRole('link', { name: '編集' })).toHaveLength(3);
    await expect(canvas.getAllByRole('button', { name: '削除' })).toHaveLength(
      3,
    );
  },
};

export const OneBook: Story = {
  args: { books: [sampleBooks[0]] },
};

/** BOOK-L06 長いタイトルでもレイアウトが崩れないか */
export const LongTitle: Story = {
  args: {
    books: [
      {
        ...sampleBooks[0],
        title:
          'はじめてのTypeScript 〜型安全なWebアプリケーション開発のための実践ガイド〜 第2版 増補改訂',
      },
      ...sampleBooks.slice(1),
    ],
  },
};

/** BOOK-D02 「いいえ」なら何もしない */
export const DeleteCancel: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const row = canvas.getByRole('row', { name: /チームで進める仕事術/ });
    const deleteButton = within(row).getByRole('button', { name: '削除' });

    await userEvent.click(deleteButton);
    await expect(
      canvas.getByRole('dialog', { name: '書籍の削除' }),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'いいえ' }));
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(args.deleteAction).not.toHaveBeenCalled();
    await expect(deleteButton).toHaveFocus();
  },
};

/** BOOK-D04 「はい」で削除して一覧へ移動する */
export const DeleteConfirm: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const row = canvas.getByRole('row', { name: /チームで進める仕事術/ });
    await userEvent.click(within(row).getByRole('button', { name: '削除' }));
    await userEvent.click(canvas.getByRole('button', { name: 'はい' }));

    await expect(args.deleteAction).toHaveBeenCalledWith('2');
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(getRouter().replace).toHaveBeenCalledWith(
      '/books?message=deleted',
    );
  },
};

/** BOOK-D08 削除に失敗したとき */
export const DeleteFailed: Story = {
  args: {
    deleteAction: fn(
      async (): Promise<DeleteBookResult> => ({
        ok: false,
        message: '対象の書籍が見つかりません',
      }),
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const row = canvas.getByRole('row', { name: /チームで進める仕事術/ });
    await userEvent.click(within(row).getByRole('button', { name: '削除' }));
    await userEvent.click(canvas.getByRole('button', { name: 'はい' }));

    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      '対象の書籍が見つかりません',
    );
    await expect(canvas.getByRole('dialog')).toBeVisible();
  },
};

// 「削除中」のストーリーで使う終わらない処理を、後片付けで終わらせるための入れ物
let finishDeleting = () => {};

/** BOOK-D06 削除処理中はボタンが押せない */
export const Deleting: Story = {
  args: {
    deleteAction: fn(() => {
      const { promise, resolve } = Promise.withResolvers<DeleteBookResult>();
      finishDeleting = () => resolve({ ok: false, message: '中断しました' });
      return promise;
    }),
  },
  beforeEach: () => {
    return () => finishDeleting();
  },
  play: async ({ canvas, userEvent }) => {
    const row = canvas.getByRole('row', { name: /チームで進める仕事術/ });
    await userEvent.click(within(row).getByRole('button', { name: '削除' }));
    await userEvent.click(canvas.getByRole('button', { name: 'はい' }));

    await expect(
      await canvas.findByRole('button', { name: 'はい' }),
    ).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'いいえ' })).toBeDisabled();
  },
};
