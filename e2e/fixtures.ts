import { test as base } from '@playwright/test';
import { ProductsPage } from './pages/ProductsPage';

export const test = base.extend<{ productsPage: ProductsPage }>({
  productsPage: async ({ page }, provide) => {
    await provide(new ProductsPage(page));
  },
});

export { expect } from '@playwright/test';
