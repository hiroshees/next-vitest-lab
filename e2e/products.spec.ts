// import { test, expect } from '@playwright/test';
import { ProductsPage } from './pages/ProductsPage';
import { test, expect } from './fixtures';

test.describe('商品一覧', () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
  });

  test('商品を検索すると、URL にキーワードが入り、一覧が絞り込まれる', async ({
    page,
  }) => {
    await productsPage.goto();
    await productsPage.search('スニーカー');

    await expect(page).toHaveURL(/[?&]q=/);
    await expect(productsPage.productNames()).toHaveText([
      '白いスニーカー',
      '赤いスニーカー',
    ]);
  });

  test('キーワード付きの URL を直接開くと、入力欄と一覧に反映されている', async () => {
    await productsPage.goto('ブーツ');

    await expect(productsPage.searchBox).toHaveValue('ブーツ');
    await expect(productsPage.productNames()).toHaveText(['黒いブーツ']);
  });

  // test('一致する商品がないと、その旨が表示される', async () => {
  //   await productsPage.goto();
  //   await productsPage.search('帽子');

  //   await expect(productsPage.noMatchMessage('帽子')).toBeVisible();
  //   await expect(productsPage.productList).toBeHidden();
  // });

  test('一致する商品がないと、その旨が表示される', async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.search('帽子');

    await expect(productsPage.noMatchMessage('帽子')).toBeVisible();
  });

  test('検索したあとブラウザの「戻る」を押すと、検索前の状態に戻る', async ({
    page,
  }) => {
    await productsPage.goto();
    await productsPage.search('スニーカー');
    await expect(page).toHaveURL(/[?&]q=/);

    await page.goBack();

    await expect(page).toHaveURL(/\/products$/);
    await expect(productsPage.productNames()).toHaveCount(3);
    await expect(productsPage.searchBox).toHaveValue('');
  });
});
