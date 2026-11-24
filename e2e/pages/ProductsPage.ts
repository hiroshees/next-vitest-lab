import type { Locator, Page } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly productList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1, name: '商品一覧' });
    this.searchBox = page.getByRole('searchbox', { name: '商品を検索' });
    this.searchButton = page.getByRole('button', { name: '検索' });
    this.productList = page.getByRole('list', { name: '商品一覧' });
  }

  async goto(keyword?: string) {
    const query = keyword ? `?${new URLSearchParams({ q: keyword })}` : '';
    await this.page.goto(`/products${query}`);
  }

  async search(keyword: string) {
    await this.searchBox.fill(keyword);
    await this.searchButton.click();
  }

  productNames() {
    return this.productList.getByRole('heading', { level: 2 });
  }

  noMatchMessage(keyword: string) {
    return this.page.getByText(`「${keyword}」に一致する商品はありません`);
  }
}
