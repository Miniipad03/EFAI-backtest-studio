import { describe, it, expect } from 'vitest';
import { runBacktest } from './engine';
import type { Candle, Signal } from './types';

function candle(date: string, close: number): Candle {
  return { date, open: close, high: close, low: close, close, volume: 0 };
}

describe('runBacktest', () => {
  it('매수 후 가격 상승하고 매도하면 자산 증가 + 거래 기록', () => {
    const candles = [
      candle('2023-01-01', 100),
      candle('2023-01-02', 110),
      candle('2023-01-03', 120),
    ];
    const signals: Signal[] = [1, 0, -1];
    const result = runBacktest(candles, signals, 1_000_000);

    expect(result.trades.filter((t) => t.side === 'buy').length).toBe(1);
    expect(result.trades.filter((t) => t.side === 'sell').length).toBe(1);
    expect(result.metrics.totalReturn).toBeGreaterThan(0);
    expect(result.equityCurve.length).toBe(3);
  });

  it('시그널이 모두 0이면 거래 없음, 자산 불변', () => {
    const candles = [candle('2023-01-01', 100), candle('2023-01-02', 110)];
    const result = runBacktest(candles, [0, 0], 1_000_000);
    expect(result.trades.length).toBe(0);
    expect(result.equityCurve[result.equityCurve.length - 1].total).toBe(1_000_000);
  });

  it('매수 없이 매도 시그널이 오면 거래 없음', () => {
    const candles = [candle('2023-01-01', 100), candle('2023-01-02', 90)];
    const result = runBacktest(candles, [0, -1], 1_000_000);
    expect(result.trades.length).toBe(0);
  });
});
