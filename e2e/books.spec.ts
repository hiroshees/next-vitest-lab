import { expect, test } from '@playwright/test';
import { BookFormPage } from './pages/BookFormPage';
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

test.describe('SCR-02 書籍の新規登録', () => {
  test('BOOK-L05 BOOK-N01 一覧から登録画面へ移動し、登録すると一覧の先頭に表示される', async ({
    page,
  }) => {
    const books = new BooksPage(page);
    const form = new BookFormPage(page);

    await books.goto();
    await books.newLink.click();

    await expect(page).toHaveURL(/\/books\/new$/);
    await expect(form.heading).toHaveText('書籍の新規登録');

    await form.fill({
      title: '  テスト駆動入門  ',
      author: '高橋次郎',
      genre: '技術書',
      publishedYear: '2020',
      memo: 'E2Eで登録',
    });
    await form.submitButton('登録する').click();

    await expect(page).toHaveURL(/\/books\?message=created$/);
    await expect(books.flash).toHaveText('登録しました');
    await expect(books.count).toHaveText('全4件');
    // 前後の空白は取り除かれて保存される
    await expect(books.titleCells().first()).toHaveText('テスト駆動入門');
    await expect(books.row('テスト駆動入門')).toContainText('高橋次郎');
  });

  test('BOOK-N02 NGなら、エラーが表示され、入力した値が残り、登録されない', async ({
    page,
  }) => {
    const books = new BooksPage(page);
    const form = new BookFormPage(page);
    await form.gotoNew();

    await form.fill({
      title: 'テスト駆動入門',
      genre: '技術書',
      publishedYear: '2020.5',
    });
    await form.submitButton('登録する').click();

    await expect(form.author).toHaveAccessibleDescription(
      '著者を入力してください',
    );
    await expect(form.publishedYear).toHaveAccessibleDescription(
      '出版年は整数で入力してください',
    );
    await expect(form.title).not.toHaveAttribute('aria-invalid');

    await expect(page).toHaveURL(/\/books\/new$/);
    await expect(form.title).toHaveValue('テスト駆動入門');
    await expect(form.genre).toHaveValue('技術書');
    await expect(form.publishedYear).toHaveValue('2020.5');

    await books.goto();
    await expect(books.count).toHaveText('全3件');
  });

  test('BOOK-N05 キャンセルすると一覧に戻り、何も登録されない', async ({
    page,
  }) => {
    const books = new BooksPage(page);
    const form = new BookFormPage(page);
    await form.gotoNew();

    await form.fill({ title: '登録しない本' });
    await form.cancelLink.click();

    await expect(page).toHaveURL(/\/books$/);
    await expect(books.count).toHaveText('全3件');
    await expect(books.row('登録しない本')).toHaveCount(0);
  });
});

test.describe('SCR-03 書籍の編集', () => {
  test('BOOK-L05 BOOK-E01 BOOK-E02 一覧から編集画面へ移動し、更新すると一覧に反映される', async ({
    page,
  }) => {
    const books = new BooksPage(page);
    const form = new BookFormPage(page);

    await books.goto();
    await books.editLink('チームで進める仕事術').click();

    await expect(page).toHaveURL(/\/books\/2\/edit$/);
    await expect(form.heading).toHaveText('書籍の編集');

    // 登録済みの値が入っている
    await expect(form.title).toHaveValue('チームで進める仕事術');
    await expect(form.author).toHaveValue('佐藤花子');
    await expect(form.genre).toHaveValue('ビジネス');
    await expect(form.publishedYear).toHaveValue('2021');
    await expect(form.memo).toHaveValue('読書会で使用');

    await form.fill({ title: 'チームで進める仕事術 改訂版', genre: 'その他' });
    await form.submitButton('更新する').click();

    await expect(page).toHaveURL(/\/books\?message=updated$/);
    await expect(books.flash).toHaveText('更新しました');
    await expect(books.count).toHaveText('全3件');
    // 更新しても並び順（新しい順＝idの順）は変わらない
    await expect(books.titleCells()).toHaveText([
      'はじめてのTypeScript',
      'チームで進める仕事術 改訂版',
      '配色の基本',
    ]);
    await expect(books.row('チームで進める仕事術 改訂版')).toContainText(
      'その他',
    );
  });

  test('BOOK-E03 NGなら、エラーが表示され、更新されない', async ({ page }) => {
    const books = new BooksPage(page);
    const form = new BookFormPage(page);
    await form.gotoEdit('2');

    await form.fill({ title: '', publishedYear: '1899' });
    await form.submitButton('更新する').click();

    await expect(form.title).toHaveAccessibleDescription(
      'タイトルを入力してください',
    );
    await expect(form.publishedYear).toHaveAccessibleDescription(
      '出版年は1900年から今年までで入力してください',
    );
    await expect(page).toHaveURL(/\/books\/2\/edit$/);
    // エラーでない項目の値は残っている
    await expect(form.author).toHaveValue('佐藤花子');
    await expect(form.genre).toHaveValue('ビジネス');

    await books.goto();
    await expect(books.row('チームで進める仕事術')).toContainText('2021');
  });

  test('BOOK-E04 存在しない id の編集画面は404画面になる', async ({ page }) => {
    await page.goto('/books/999/edit');

    // Suspense の中で notFound() を呼ぶと、ステータスコードは200のことがあるので、表示で確かめる
    await expect(page.getByText('This page could not be found.')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'タイトル' })).toHaveCount(
      0,
    );
  });
});

test.describe('SCR-01 削除（確認モーダル）', () => {
  test('BOOK-D01 BOOK-D02 BOOK-D07 「いいえ」なら閉じて何もせず、フォーカスが戻る', async ({
    page,
  }) => {
    const books = new BooksPage(page);
    await books.goto();

    await books.deleteButton('チームで進める仕事術').click();

    await expect(books.dialog).toBeVisible();
    await expect(books.dialog).toContainText(
      '『チームで進める仕事術』を削除しますか？',
    );
    await expect(books.noButton).toBeFocused();

    await books.noButton.click();

    await expect(books.dialog).toBeHidden();
    await expect(books.deleteButton('チームで進める仕事術')).toBeFocused();
    await expect(books.count).toHaveText('全3件');
  });

  test('BOOK-D03 Esc や背景のクリックでも、閉じて何もしない', async ({
    page,
  }) => {
    const books = new BooksPage(page);
    await books.goto();

    await books.deleteButton('配色の基本').click();
    await expect(books.dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(books.dialog).toBeHidden();
    await expect(books.deleteButton('配色の基本')).toBeFocused();

    await books.deleteButton('配色の基本').click();
    await expect(books.dialog).toBeVisible();
    await books.clickBackdrop();
    await expect(books.dialog).toBeHidden();

    await expect(books.count).toHaveText('全3件');
  });

  test('BOOK-D04 BOOK-D05 「はい」で削除され、一覧から消えて「削除しました」が表示される', async ({
    page,
  }) => {
    const books = new BooksPage(page);
    await books.goto();

    await books.deleteButton('チームで進める仕事術').click();
    await books.yesButton.click();

    await expect(page).toHaveURL(/\/books\?message=deleted$/);
    await expect(books.dialog).toBeHidden();
    await expect(books.flash).toHaveText('削除しました');
    await expect(books.count).toHaveText('全2件');
    await expect(books.titleCells()).toHaveText([
      'はじめてのTypeScript',
      '配色の基本',
    ]);
  });

  test('BOOK-D08 モーダルを開いている間にほかの人が削除したら、メッセージを表示する', async ({
    page,
  }) => {
    const books = new BooksPage(page);
    await books.goto();
    await books.deleteButton('チームで進める仕事術').click();

    // 別のタブで、同じ書籍を先に削除する
    const other = new BooksPage(await page.context().newPage());
    await other.goto();
    await other.deleteButton('チームで進める仕事術').click();
    await other.yesButton.click();
    await expect(other.flash).toHaveText('削除しました');

    // 元のタブで「はい」を押す
    await books.yesButton.click();

    await expect(books.dialog.getByRole('alert')).toHaveText(
      '対象の書籍が見つかりません',
    );
    await expect(books.dialog).toBeVisible();
  });

  test('BOOK-E04 編集している間にほかの人が削除したら、更新時にメッセージを表示する', async ({
    page,
  }) => {
    const form = new BookFormPage(page);
    await form.gotoEdit('2');

    // 別のタブで、編集中の書籍を削除する
    const other = new BooksPage(await page.context().newPage());
    await other.goto();
    await other.deleteButton('チームで進める仕事術').click();
    await other.yesButton.click();
    await expect(other.flash).toHaveText('削除しました');

    // 元のタブで「更新する」を押す
    await form.submitButton('更新する').click();

    await expect(form.formError).toHaveText('対象の書籍が見つかりません');
    await expect(page).toHaveURL(/\/books\/2\/edit$/);
  });
});
