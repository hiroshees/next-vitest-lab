import { findProducts } from '@/features/products/repository';

export async function GET(request: Request) {
  const keyword = new URL(request.url).searchParams.get('q') ?? '';

  if (keyword.length > 50) {
    return Response.json(
      { error: 'キーワードは50文字以内で指定してください' },
      { status: 400 },
    );
  }

  const products = await findProducts(keyword);
  return Response.json({ products });
}
