import { describe, it, expect } from 'vitest';
import { VolatilityBreakout } from './volatilityBreakout';
import type { Candle } from '../types';

describe('VolatilityBreakout', () => {
  it('당일 고가가 목표가를 돌파하면 1, 첫날은 0', () => {
    // day0: range=10-8=2, day1: target=10+2*0.5=11, high=12>=11 → 1
    const candles: Candle[] = [
      { date: '2023-01-01', open: 9, high: 10, low: 8, close: 9, volume: 0 },
      { date: '2023-01-02', open: 10, high: 12, low: 9, close: 11, volume: 0 },
    ];
    const signals = new VolatilityBreakout(0.5).generateSignals(candles);
    expect(signals[0]).toBe(0);
    expect(signals[1]).toBe(1);
  });

  it('목표가 미달이면 0', () => {
    const candles: Candle[] = [
      { date: '2023-01-01', open: 9, high: 10, low: 8, close: 9, volume: 0 },
      { date: '2023-01-02', open: 10, high: 10.5, low: 9, close: 10, volume: 0 },
    ];
    const signals = new VolatilityBreakout(0.5).generateSignals(candles);
    expect(signals[1]).toBe(0); // target=11 > high=10.5
  });

  it('단일 캔들이면 [0]', () => {
    const candles: Candle[] = [
      { date: '2023-01-01', open: 9, high: 10, low: 8, close: 9, volume: 0 },
    ];
    expect(new VolatilityBreakout().generateSignals(candles)).toEqual([0]);
  });
});
