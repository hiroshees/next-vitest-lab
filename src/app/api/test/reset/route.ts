import { resetBooks } from '@/features/books/repository';

/** E2E用：データを初期状態に戻す。E2E=1 のときだけ有効 */
export async function POST() {
  if (process.env.E2E !== '1') {
    return new Response(null, { status: 404 });
  }
  resetBooks();
  return Response.json({ ok: true });
}
