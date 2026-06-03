import { describe, it, expect } from 'vitest';
import { MaCross } from './maCross';
import type { Candle } from '../types';

function candle(date: string, close: number): Candle {
  return { date, open: close, high: close, low: close, close, volume: 0 };
}

describe('MaCross', () => {
  it('골든크로스에서 1, 데드크로스에서 -1, 그 외 0', () => {
    const closes = [10, 10, 10, 12, 14, 16, 14, 12, 10, 8];
    const candles = closes.map((c, i) => candle(`2023-01-${String(i + 1).padStart(2, '0')}`, c));
    const signals = new MaCross(2, 3).generateSignals(candles);

    // SMA(2): [null,10,10,11,13,15,15,13,11,9]
    // SMA(3): [null,null,10,10.67,12,14,14.67,14,12,10]
    // golden cross at index 3 (SMA2 crosses above SMA3)
    // dead cross at index 7 (SMA2 crosses below SMA3)
    const expectedSignals = [0, 0, 0, 1, 0, 0, 0, -1, 0, 0];
    expect(signals).toEqual(expectedSignals);
  });

  it('처음 long-1개의 신호는 0 (웜업 경계)', () => {
    const closes = [10, 10, 10, 12, 14, 16, 14, 12, 10, 8];
    const long = 3;
    const candles = closes.map((c, i) => candle(`2023-01-${String(i + 1).padStart(2, '0')}`, c));
    const signals = new MaCross(2, long).generateSignals(candles);

    // First long-1 entries must all be 0 (warm-up period)
    for (let i = 0; i < long - 1; i++) {
      expect(signals[i]).toBe(0);
    }
  });

  it('데이터가 long 기간보다 짧으면 모두 0', () => {
    const candles = [candle('2023-01-01', 10), candle('2023-01-02', 11)];
    const signals = new MaCross(5, 20).generateSignals(candles);
    expect(signals).toEqual([0, 0]);
  });
});
