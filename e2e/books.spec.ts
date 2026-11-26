import { expect, test } from '@playwright/test';
import { BooksPage } from './pages/BooksPage';

// データはサーバーに1つしかないので、このファイルのテストは順番に実行する
test.describe.configure({ mode: 'default' });

test.beforeEach(async ({ request }) => {
  const res = await request.post('/api/test/reset');
  expect(
    res.ok(),
    'E2E=1 でサーバーが起動しているか確認してください',
  ).toBeTruthy();
});

test.describe('SCR-01 書籍一覧', () => {
  test('BOOK-L01 BOOK-L04 初期データ3件が新しい順に表示される', async ({
    page,
  }) => {
    const books = new BooksPage(page);
    await books.goto();

    await expect(books.heading).toBeVisible();
    await expect(books.count).toHaveText('全3件');
    await expect(books.titleCells()).toHaveText([
      'はじめてのTypeScript',
      'チームで進める仕事術',
      '配色の基本',
    ]);
    await expect(books.row('チームで進める仕事術')).toContainText('佐藤花子');
    await expect(books.row('チームで進める仕事術')).toContainText('ビジネス');
    await expect(books.row('チームで進める仕事術')).toContainText('2021');
  });

  test('BOOK-L03 message に応じた完了メッセージが表示される', async ({
    page,
  }) => {
    const books = new BooksPage(page);

    await books.goto('?message=updated');
    await expect(books.flash).toHaveText('更新しました');

    await books.goto();
    await expect(books.flash).toHaveCount(0);
  });

  test('BOOK-L05 新規登録・編集へのリンク先が正しい', async ({ page }) => {
    const books = new BooksPage(page);
    await books.goto();

    // 遷移先の画面はまだないので、今回はリンク先だけ確認する（4-2・4-3でクリックして確認）
    await expect(books.newLink).toHaveAttribute('href', '/books/new');
    await expect(books.editLink('はじめてのTypeScript')).toHaveAttribute(
      'href',
      '/books/3/edit',
    );
  });
});
