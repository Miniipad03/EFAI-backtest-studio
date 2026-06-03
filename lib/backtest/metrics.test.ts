import { describe, it, expect } from 'vitest';
import { computeMetrics } from './metrics';
import type { EquityPoint, Trade } from './types';

function eq(date: string, total: number): EquityPoint {
  return { date, cash: total, stock: 0, total };
}

describe('computeMetrics', () => {
  it('총수익률·거래수·승률 계산', () => {
    const equity: EquityPoint[] = [
      eq('2023-01-01', 1_000_000),
      eq('2023-01-02', 1_100_000),
      eq('2023-12-31', 1_200_000),
    ];
    const trades: Trade[] = [
      { date: '2023-01-02', side: 'buy', qty: 1, price: 100, fee: 0, tax: 0, pnl: 0 },
      { date: '2023-06-01', side: 'sell', qty: 1, price: 120, fee: 0, tax: 0, pnl: 20 },
      { date: '2023-09-01', side: 'sell', qty: 1, price: 90, fee: 0, tax: 0, pnl: -10 },
    ];
    const m = computeMetrics(equity, trades, 1_000_000);

    expect(m.totalReturn).toBeCloseTo(0.2, 6);
    expect(m.tradeCount).toBe(3);
    expect(m.winRate).toBeCloseTo(0.5, 6); // 매도 2건 중 1건 이익
  });

  it('빈 거래·단일 포인트도 안전', () => {
    const m = computeMetrics([eq('2023-01-01', 1_000_000)], [], 1_000_000);
    expect(m.totalReturn).toBe(0);
    expect(m.tradeCount).toBe(0);
    expect(m.winRate).toBe(0);
    expect(m.sharpe).toBe(0);
  });

  it('MDD: 낙폭이 있으면 음수', () => {
    const equity = [
      eq('2023-01-01', 1_000_000),
      eq('2023-01-02', 1_200_000), // peak
      eq('2023-01-03', 900_000),   // -25% drawdown
    ];
    const m = computeMetrics(equity, [], 1_000_000);
    expect(m.mdd).toBeCloseTo(-0.25, 4);
  });
});
