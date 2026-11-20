import { describe, it, expect } from 'vitest';
import { calcShippingFee } from './shipping';

describe('calcShippingFee', () => {
  describe('送料無料の境界', () => {
    it.each([
      { subtotal: 4999, expected: 500 },
      { subtotal: 5000, expected: 0 },
      { subtotal: 5001, expected: 0 },
    ])('小計 $subtotal 円 → 送料 $expected 円', ({ subtotal, expected }) => {
      expect(calcShippingFee(subtotal)).toBe(expected);
    });
  });

  it('小計0円は送料500円', () => {
    expect(calcShippingFee(0)).toBe(500);
  });

  it('負の小計はエラー', () => {
    expect(() => calcShippingFee(-1)).toThrow('subtotal must be >= 0');
  });
});
