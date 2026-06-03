import type { BacktestResult, Candle, CostConfig, EquityPoint, Signal, Trade } from './types';
import { DEFAULT_COST } from './types';
import { computeMetrics } from './metrics';

export function runBacktest(
  candles: Candle[],
  signals: Signal[],
  initialCapital = 10_000_000,
  cost: CostConfig = DEFAULT_COST,
): BacktestResult {
  let cash = initialCapital;
  let position = 0;
  let avgPrice = 0;
  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  for (let i = 0; i < candles.length; i++) {
    const { date, close } = candles[i];
    const signal = signals[i] ?? 0;

    if (signal === 1) {
      const buyPrice = close * (1 + cost.slippageRate);
      const buyFeePerShare = buyPrice * (cost.commissionRate + cost.institutionalFeeRate);
      const costPerShare = buyPrice + buyFeePerShare;
      const qty = costPerShare > 0 ? Math.floor(cash / costPerShare) : 0;

      if (qty > 0) {
        cash -= qty * costPerShare;
        const newQty = position + qty;
        avgPrice = newQty > 0 ? (avgPrice * position + buyPrice * qty) / newQty : 0;
        position = newQty;
        trades.push({ date, side: 'buy', qty, price: buyPrice, fee: buyFeePerShare * qty, tax: 0, pnl: 0 });
      }
    } else if (signal === -1 && position > 0) {
      const qty = position;
      const sellPrice = close * (1 - cost.slippageRate);
      const sellFeePerShare = sellPrice * (cost.commissionRate + cost.institutionalFeeRate);
      const sellTaxPerShare = sellPrice * cost.taxRate;
      const netPerShare = sellPrice - sellFeePerShare - sellTaxPerShare;
      cash += qty * netPerShare;
      const pnl = (sellPrice - avgPrice) * qty - (sellFeePerShare + sellTaxPerShare) * qty;
      trades.push({ date, side: 'sell', qty, price: sellPrice, fee: sellFeePerShare * qty, tax: sellTaxPerShare * qty, pnl });
      position = 0;
      avgPrice = 0;
    }

    equityCurve.push({ date, cash, stock: position * close, total: cash + position * close });
  }

  return { equityCurve, trades, metrics: computeMetrics(equityCurve, trades, initialCapital) };
}
