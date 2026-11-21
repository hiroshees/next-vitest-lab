import { test, expect } from '@playwright/test';

test('商品を検索すると、URL にキーワードが入り、一覧が絞り込まれる', async ({
  page,
}) => {
  await page.goto('/products');
  await expect(
    page.getByRole('heading', { level: 1, name: '商品一覧' }),
  ).toBeVisible();

  await page.getByRole('searchbox', { name: '商品を検索' }).fill('スニーカー');
  await page.getByRole('button', { name: '検索' }).click();

  await expect(page).toHaveURL(/[?&]q=/);
  expect(new URL(page.url()).searchParams.get('q')).toBe('スニーカー');

  const list = page.getByRole('list', { name: '商品一覧' });
  await expect(list.getByRole('heading', { level: 2 })).toHaveText([
    '白いスニーカー',
    '赤いスニーカー',
  ]);
});
