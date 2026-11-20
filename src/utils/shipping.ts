export function calcShippingFee(subtotal: number): number {
  if (subtotal < 0) throw new Error('subtotal must be >= 0');
  return subtotal >= 5000 ? 0 : 500;
}
