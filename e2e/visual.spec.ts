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
