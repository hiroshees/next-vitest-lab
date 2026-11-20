/**
 * URL の page の値から、現在のページ番号を決める。
 * - page がない、数字だけでない（"abc"、"1abc"、""）、1 未満 → 1
 * - totalPages より大きい → totalPages（最後のページ）
 */
export function parseCurrentPage(
  rawPage: string | null,
  totalPages: number,
): number {
  if (rawPage === null || !/^\d+$/.test(rawPage)) {
    return 1;
  }

  const page = Number(rawPage);
  if (page < 1) {
    return 1;
  }
  if (page > totalPages) {
    return totalPages;
  }
  return page;
}

/**
 * 現在のクエリを残したまま、page だけを変えた URL を作る。
 */
export function createPageHref(
  pathname: string,
  query: string,
  page: number,
): string {
  const params = new URLSearchParams(query);
  params.set('page', String(page));
  return `${pathname}?${params.toString()}`;
}
