import type { Metrics } from '@/lib/backtest/types';

const pct = (v: number) => `${(v * 100).toFixed(2)}%`;
const num = (v: number, d = 2) => (isFinite(v) ? v.toFixed(d) : '—');

interface Props {
  metrics: Metrics;
  /** 같은 기간 Buy & Hold 수익률 — 전달 시 비교 카드 표시 */
  benchmarkReturn?: number;
}

export default function MetricsCards({ metrics, benchmarkReturn }: Props) {
  const cards: { label: string; value: string; good: boolean; desc: string }[] = [
    {
      label: '총 수익률', value: pct(metrics.totalReturn), good: metrics.totalReturn >= 0,
      desc: '기간 전체의 최종 자산 증감률. (최종 자산 ÷ 초기 자본) − 1',
    },
    {
      label: 'CAGR', value: pct(metrics.cagr), good: metrics.cagr >= 0,
      desc: '연평균 복리 수익률. 기간이 달라도 비교할 수 있게 1년 기준으로 환산한 값.',
    },
    {
      label: '샤프 비율', value: num(metrics.sharpe), good: metrics.sharpe >= 0,
      desc: '변동성 대비 수익. 1 이상이면 양호, 높을수록 같은 위험으로 더 번 것.',
    },
    {
      label: 'MDD', value: pct(metrics.mdd), good: metrics.mdd >= 0,
      desc: '최대 낙폭. 고점 대비 가장 크게 하락했던 비율 — 0에 가까울수록 안전.',
    },
    {
      label: '승률', value: pct(metrics.winRate), good: metrics.winRate >= 0.5,
      desc: '이익을 내고 끝난 매도 거래의 비율.',
    },
    {
      label: '거래 횟수', value: `${metrics.tradeCount}회`, good: true,
      desc: '기간 중 발생한 매수+매도 체결 횟수. 너무 많으면 수수료·세금 부담 증가.',
    },
  ];

  if (benchmarkReturn !== undefined) {
    const excess = metrics.totalReturn - benchmarkReturn;
    cards.push({
      label: 'Buy & Hold 대비',
      value: `${excess >= 0 ? '+' : ''}${pct(excess)}`,
      good: excess >= 0,
      desc: `같은 기간 단순 보유(${pct(benchmarkReturn)}) 대비 전략의 초과 수익률.`,
    });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, good, desc }) => (
        <div
          key={label}
          className="group relative bg-surface-card rounded-lg p-4 border border-surface-border"
        >
          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
            {label}
            <span className="text-slate-600 cursor-help" title={desc}>ⓘ</span>
          </p>
          <p className={`text-xl font-bold ${good ? 'text-emerald-400' : 'text-red-400'}`}>{value}</p>
          <div className="pointer-events-none absolute left-0 bottom-full mb-2 z-10 hidden group-hover:block w-56 bg-slate-900 border border-surface-border rounded-lg p-2.5 text-xs text-slate-300 shadow-xl">
            {desc}
          </div>
        </div>
      ))}
    </div>
  );
}
