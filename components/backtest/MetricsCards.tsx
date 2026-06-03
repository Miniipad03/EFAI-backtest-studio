import type { Metrics } from '@/lib/backtest/types';

const pct = (v: number) => `${(v * 100).toFixed(2)}%`;
const num = (v: number, d = 2) => (isFinite(v) ? v.toFixed(d) : '—');

export default function MetricsCards({ metrics }: { metrics: Metrics }) {
  const cards = [
    { label: '총 수익률', value: pct(metrics.totalReturn), good: metrics.totalReturn >= 0 },
    { label: 'CAGR', value: pct(metrics.cagr), good: metrics.cagr >= 0 },
    { label: '샤프 비율', value: num(metrics.sharpe), good: metrics.sharpe >= 0 },
    { label: 'MDD', value: pct(metrics.mdd), good: metrics.mdd >= 0 },
    { label: '승률', value: pct(metrics.winRate), good: metrics.winRate >= 0.5 },
    { label: '거래 횟수', value: `${metrics.tradeCount}회`, good: true },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards.map(({ label, value, good }) => (
        <div key={label} className="bg-surface-card rounded-lg p-4 border border-surface-border">
          <p className="text-xs text-slate-400 mb-1">{label}</p>
          <p className={`text-xl font-bold ${good ? 'text-emerald-400' : 'text-red-400'}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
