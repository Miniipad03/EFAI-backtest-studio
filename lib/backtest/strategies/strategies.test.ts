import { describe, it, expect } from 'vitest';
import type { Candle } from '../types';
import { RSIStrategy } from './rsiStrategy';
import { MACDStrategy } from './macdStrategy';
import { BollingerBandStrategy } from './bollingerBandStrategy';
import { buildStrategy, STRATEGY_CATALOG } from './index';

function makeCandles(closes: number[]): Candle[] {
  return closes.map((c, i) => ({
    date: `2023-01-${String(i + 1).padStart(2, '0')}`,
    open: c, high: c * 1.01, low: c * 0.99, close: c, volume: 1000,
  }));
}

describe('RSIStrategy', () => {
  it('결과 길이 = 입력 길이', () => {
    const candles = makeCandles(Array.from({ length: 30 }, (_, i) => 100 + i));
    expect(new RSIStrategy(14, 30, 70).generateSignals(candles).length).toBe(30);
  });
  it('period+1 미만이면 모두 0', () => {
    expect(new RSIStrategy(14).generateSignals(makeCandles([100, 101, 102]))).toEqual([0, 0, 0]);
  });
});

describe('MACDStrategy', () => {
  it('결과 길이 = 입력 길이', () => {
    const candles = makeCandles(Array.from({ length: 50 }, (_, i) => 100 + (i % 10)));
    expect(new MACDStrategy().generateSignals(candles).length).toBe(50);
  });
});

describe('BollingerBandStrategy', () => {
  it('결과 길이 = 입력 길이', () => {
    const candles = makeCandles(Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i)));
    expect(new BollingerBandStrategy().generateSignals(candles).length).toBe(30);
  });
});

describe('buildStrategy + STRATEGY_CATALOG', () => {
  it('카탈로그에 6개 전략 (프리셋 5 + 커스텀)', () => {
    expect(STRATEGY_CATALOG.length).toBe(6);
  });
  it('buildStrategy가 각 id로 Strategy를 반환', () => {
    for (const meta of STRATEGY_CATALOG) {
      const params = Object.fromEntries(meta.params.map(p => [p.key, p.default]));
      const s = buildStrategy(meta.id, params);
      expect(typeof s.generateSignals).toBe('function');
    }
  });
});
