import { test, expect } from '@playwright/test';

test.describe('商品一覧', () => {
  test('商品を検索すると、URL にキーワードが入り、一覧が絞り込まれる', async ({
    page,
  }) => {
    await page.goto('/products');
    await expect(
      page.getByRole('heading', { level: 1, name: '商品一覧' }),
    ).toBeVisible();

    await page
      .getByRole('searchbox', { name: '商品を検索' })
      .fill('スニーカー');
    await page.getByRole('button', { name: '検索' }).click();

    await expect(page).toHaveURL(/[?&]q=/);
    expect(new URL(page.url()).searchParams.get('q')).toBe('スニーカー');

    const list = page.getByRole('list', { name: '商品一覧' });
    await expect(list.getByRole('heading', { level: 2 })).toHaveText([
      '白いスニーカー',
      '赤いスニーカー',
    ]);
  });

  test('キーワード付きの URL を直接開くと、入力欄と一覧に反映されている', async ({
    page,
  }) => {
    await page.goto(`/products?${new URLSearchParams({ q: 'ブーツ' })}`);

    await expect(
      page.getByRole('searchbox', { name: '商品を検索' }),
    ).toHaveValue('ブーツ');
    const list = page.getByRole('list', { name: '商品一覧' });
    await expect(list.getByRole('heading', { level: 2 })).toHaveText([
      '黒いブーツ',
    ]);
  });

  test('一致する商品がないと、その旨が表示される', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('searchbox', { name: '商品を検索' }).fill('帽子');
    await page.getByRole('button', { name: '検索' }).click();

    await expect(
      page.getByText('「帽子」に一致する商品はありません'),
    ).toBeVisible();
    await expect(page.getByRole('list', { name: '商品一覧' })).toBeHidden();
  });

  test('検索したあとブラウザの「戻る」を押すと、検索前の状態に戻る', async ({
    page,
  }) => {
    await page.goto('/products');
    await page
      .getByRole('searchbox', { name: '商品を検索' })
      .fill('スニーカー');
    await page.getByRole('button', { name: '検索' }).click();
    await expect(page).toHaveURL(/[?&]q=/);

    await page.goBack();

    await expect(page).toHaveURL(/\/products$/);
    await expect(
      page
        .getByRole('list', { name: '商品一覧' })
        .getByRole('heading', { level: 2 }),
    ).toHaveCount(3);
    await expect(
      page.getByRole('searchbox', { name: '商品を検索' }),
    ).toHaveValue('');
  });
});
