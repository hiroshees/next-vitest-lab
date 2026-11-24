import { test, expect } from '@playwright/test';

test.describe('ページのタイトル', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const { path, title } of [
    { path: '/products', title: '商品一覧 | サンプルショップ' },
    { path: '/contact', title: 'お問い合わせ | サンプルショップ' },
  ]) {
    test(`${path} のタイトルは「${title}」`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
    });
  }
});
