import { describe, it, expect } from 'vitest';
import { calcDiscount, type MemberRank } from './discount';

describe('calcDiscount', () => {
  describe('ランクごとの割引率', () => {
    it.each<{ rank: MemberRank; expected: number }>([
      { rank: 'gold', expected: 10 },
      { rank: 'silver', expected: 5 },
      { rank: 'none', expected: 0 },
    ])('$rank は小計100円で $expected 円引き', ({ rank, expected }) => {
      expect(calcDiscount(100, rank)).toBe(expected);
    });
  });

  describe('1円未満は切り捨て', () => {
    it.each<{ subtotal: number; rank: MemberRank; expected: number }>([
      { subtotal: 99, rank: 'gold', expected: 9 }, // 9.9 → 9
      { subtotal: 99, rank: 'silver', expected: 4 }, // 4.95 → 4
    ])(
      '$rank・小計 $subtotal 円 → $expected 円',
      ({ subtotal, rank, expected }) => {
        expect(calcDiscount(subtotal, rank)).toBe(expected);
      },
    );
  });

  describe('小計の境界', () => {
    it('0円は割引0円', () => {
      expect(calcDiscount(0, 'gold')).toBe(0);
    });

    it('負の小計はエラー', () => {
      expect(() => calcDiscount(-1, 'gold')).toThrow(
        'subtotal must not be less than 0',
      );
    });
  });
});
