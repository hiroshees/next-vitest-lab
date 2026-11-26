import { test, expect } from '@playwright/test';

test.describe('見た目', () => {
  test('商品一覧', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('list', { name: '商品一覧' })).toBeVisible();

    await expect(page).toHaveScreenshot('products.png', { fullPage: true });
  });

  test('お問い合わせ：入力エラーの状態', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: '送信' }).click();
    await expect(page.getByText('お名前を入力してください')).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot('contact-errors.png');
  });
});

test.describe('書籍管理', () => {
  // 撮る前に、データを初期状態（3件）に戻す
  test.beforeEach(async ({ request }) => {
    await request.post('/api/test/reset');
  });

  test('書籍一覧', async ({ page }) => {
    await page.goto('/books');
    await expect(page).toHaveScreenshot('books-list.png', { fullPage: true });
  });

  test('新規登録：入力エラー', async ({ page }) => {
    await page.goto('/books/new');
    await page.getByRole('button', { name: '登録する' }).click();
    await expect(page.getByText('タイトルを入力してください')).toBeVisible();

    await expect(page).toHaveScreenshot('books-new-errors.png', {
      fullPage: true,
    });
  });

  test('新規登録：登録後の一覧', async ({ page }) => {
    await page.goto('/books/new');
    await page
      .getByRole('textbox', { name: 'タイトル' })
      .fill('テスト駆動入門');
    await page.getByRole('textbox', { name: '著者' }).fill('高橋次郎');
    await page
      .getByRole('combobox', { name: 'ジャンル' })
      .selectOption('技術書');
    await page.getByRole('textbox', { name: '出版年' }).fill('2020');
    await page.getByRole('button', { name: '登録する' }).click();
    await expect(page.getByRole('main').getByRole('status')).toHaveText(
      '登録しました',
    );

    await expect(page).toHaveScreenshot('books-created.png', {
      fullPage: true,
    });
  });

  test('削除の確認モーダル', async ({ page }) => {
    await page.goto('/books');
    await page
      .getByRole('row', { name: /チームで進める仕事術/ })
      .getByRole('button', { name: '削除' })
      .click();
    await expect(
      page.getByRole('dialog', { name: '書籍の削除' }),
    ).toBeVisible();

    await expect(page).toHaveScreenshot('books-delete-dialog.png');
  });
});
