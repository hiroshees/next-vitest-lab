export type MemberRank = 'gold' | 'silver' | 'none';

const DISCOUNT_PERCENT: Record<MemberRank, number> = {
  gold: 10,
  silver: 5,
  none: 0,
};
/**
 * 小計と会員ランクから割引額を計算する関数（1円未満切り捨て）
 * @param subtotal 小計（金額）
 * @param memberRank 会員ランク ('gold' | 'silver' | 'none')
 * @returns 割引額
 */
export function calcDiscount(subtotal: number, memberRank: MemberRank): number {
  if (subtotal < 0) {
    throw new Error('subtotal must not be less than 0');
  }
  return Math.floor((subtotal * DISCOUNT_PERCENT[memberRank]) / 100);
}
