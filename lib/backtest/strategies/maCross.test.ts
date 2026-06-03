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

    expect(signals.length).toBe(closes.length);
    expect(signals[0]).toBe(0);
    expect(signals[1]).toBe(0);
    expect(signals).toContain(1);
    expect(signals).toContain(-1);
  });

  it('데이터가 long 기간보다 짧으면 모두 0', () => {
    const candles = [candle('2023-01-01', 10), candle('2023-01-02', 11)];
    const signals = new MaCross(5, 20).generateSignals(candles);
    expect(signals).toEqual([0, 0]);
  });
});
