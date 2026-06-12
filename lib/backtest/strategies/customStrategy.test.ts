import { describe, it, expect } from 'vitest';
import type { Candle } from '../types';
import { CustomStrategy, CONDITION_DEFS } from './customStrategy';

function makeCandles(closes: number[]): Candle[] {
  return closes.map((c, i) => ({
    date: `2023-01-${String(i + 1).padStart(2, '0')}`,
    open: c, high: c * 1.01, low: c * 0.99, close: c, volume: 1000,
  }));
}

describe('CustomStrategy', () => {
  it('SMA 상향돌파 매수 규칙 — 돌파 시점에만 1', () => {
    // closes [10,10,10,8,8,20], SMA(3) = [null,null,10,9.33,8.67,12.67]
    // i=5: 전일 종가 8 <= 전일 SMA 8.67, 당일 종가 20 > 당일 SMA 12.67 → 매수
    const s = new CustomStrategy([
      { kind: 'price_cross_above_sma', params: { period: 3 }, action: 'buy' },
    ]);
    expect(s.generateSignals(makeCandles([10, 10, 10, 8, 8, 20]))).toEqual([0, 0, 0, 0, 0, 1]);
  });

  it('SMA 하향돌파 매도 규칙 — 이탈 시점에만 -1', () => {
    const s = new CustomStrategy([
      { kind: 'price_cross_below_sma', params: { period: 3 }, action: 'sell' },
    ]);
    expect(s.generateSignals(makeCandles([10, 10, 10, 12, 12, 5]))).toEqual([0, 0, 0, 0, 0, -1]);
  });

  it('규칙 우선순위 — 같은 날 매칭되면 먼저 정의된 규칙이 이긴다', () => {
    // RSI(2) < 200 은 RSI 정의 구간(i>=2)에서 항상 참
    const buyFirst = new CustomStrategy([
      { kind: 'rsi_below', params: { period: 2, threshold: 200 }, action: 'buy' },
      { kind: 'rsi_below', params: { period: 2, threshold: 200 }, action: 'sell' },
    ]);
    expect(buyFirst.generateSignals(makeCandles([10, 11, 12, 13, 14]))).toEqual([0, 0, 1, 1, 1]);
  });

  it('규칙이 없으면 모두 0', () => {
    const s = new CustomStrategy([]);
    expect(s.generateSignals(makeCandles([10, 11, 12]))).toEqual([0, 0, 0]);
  });

  it('CONDITION_DEFS 기본값으로 모든 조건이 오류 없이 평가된다', () => {
    const candles = makeCandles(Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i / 3) * 10));
    for (const def of CONDITION_DEFS) {
      const params = Object.fromEntries(def.params.map(p => [p.key, p.default]));
      const s = new CustomStrategy([{ kind: def.kind, params, action: 'buy' }]);
      expect(s.generateSignals(candles).length).toBe(60);
    }
  });
});
