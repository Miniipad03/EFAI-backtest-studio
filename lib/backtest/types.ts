export interface Candle {
  date: string;   // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Signal = 1 | -1 | 0; // 1=매수, -1=매도, 0=보유

export interface Strategy {
  generateSignals(candles: Candle[]): Signal[];
}

export interface Trade {
  date: string;
  side: 'buy' | 'sell';
  qty: number;
  price: number;
  fee: number;
  tax: number;
  pnl: number;
}

export interface EquityPoint {
  date: string;
  cash: number;
  stock: number;
  total: number;
}

export interface Metrics {
  totalReturn: number;
  cagr: number;
  sharpe: number;
  mdd: number;
  winRate: number;
  tradeCount: number;
}

export interface BacktestResult {
  equityCurve: EquityPoint[];
  trades: Trade[];
  metrics: Metrics;
}

export interface CostConfig {
  commissionRate: number;        // 위탁수수료 (양방향)
  institutionalFeeRate: number;  // 유관기관제비용 (양방향)
  taxRate: number;               // 증권거래세 (매도 시만)
  slippageRate: number;          // 슬리피지
}

// 원본 CostConfig 기본값과 동일
export const DEFAULT_COST: CostConfig = {
  commissionRate: 0,
  institutionalFeeRate: 0.0036396 / 100,
  taxRate: 0.20 / 100,
  slippageRate: 0.1 / 100,
};
