import type { EquityPoint, Metrics, Trade } from './types';

const TRADING_DAYS = 252;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function computeMetrics(
  equity: EquityPoint[],
  trades: Trade[],
  initialCapital: number,
): Metrics {
  const totals = equity.map((e) => e.total);
  const finalEquity = totals.length ? totals[totals.length - 1] : initialCapital;
  const totalReturn = (finalEquity - initialCapital) / initialCapital;

  let years: number;
  if (equity.length >= 2) {
    const days = (Date.parse(equity[equity.length - 1].date) - Date.parse(equity[0].date)) / MS_PER_DAY;
    years = Math.max(days / 365.25, 1 / 365.25);
  } else {
    years = Math.max(totals.length / TRADING_DAYS, 1 / TRADING_DAYS);
  }
  const cagr = finalEquity > 0 && initialCapital > 0
    ? Math.pow(finalEquity / initialCapital, 1 / years) - 1
    : -1;

  const dailyReturns: number[] = [];
  for (let i = 1; i < totals.length; i++) {
    if (totals[i - 1] !== 0) dailyReturns.push(totals[i] / totals[i - 1] - 1);
  }
  let sharpe = 0;
  if (dailyReturns.length > 1) {
    const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / (dailyReturns.length - 1);
    const std = Math.sqrt(variance);
    if (std > 0) sharpe = (mean / std) * Math.sqrt(TRADING_DAYS);
  }

  let mdd = 0;
  let peak = totals.length ? totals[0] : initialCapital;
  for (const t of totals) {
    if (t > peak) peak = t;
    if (peak > 0) mdd = Math.min(mdd, (t - peak) / peak);
  }

  const tradeCount = trades.length;
  const sells = trades.filter((t) => t.side === 'sell');
  const wins = sells.filter((t) => t.pnl > 0).length;
  const winRate = sells.length ? wins / sells.length : 0;

  return { totalReturn, cagr, sharpe, mdd, winRate, tradeCount };
}
