'use client';
import { useState } from 'react';
import { STRATEGY_CATALOG, type StrategyId } from '@/lib/backtest/strategies/index';

interface FormParams {
  code: string;
  years: number;
  initialCapital: number;
  strategyId: StrategyId;
  strategyParams: Record<string, number>;
}

export default function BacktestForm({
  onSubmit,
  loading,
}: {
  onSubmit: (p: FormParams) => void;
  loading: boolean;
}) {
  const [code, setCode] = useState('005930');
  const [years, setYears] = useState(3);
  const [capital, setCapital] = useState(10_000_000);
  const [stratId, setStratId] = useState<StrategyId>('ma_cross');
  const strat = STRATEGY_CATALOG.find(s => s.id === stratId)!;
  const [sparams, setSparams] = useState<Record<string, number>>(
    () => Object.fromEntries(strat.params.map(p => [p.key, p.default])),
  );

  const handleStratChange = (id: StrategyId) => {
    setStratId(id);
    const s = STRATEGY_CATALOG.find(x => x.id === id)!;
    setSparams(Object.fromEntries(s.params.map(p => [p.key, p.default])));
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ code, years, initialCapital: capital, strategyId: stratId, strategyParams: sparams });
      }}
      className="bg-surface-card border border-surface-border rounded-xl p-6 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">종목코드</label>
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="005930"
            maxLength={6}
            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">기간</label>
          <select
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          >
            {[1, 2, 3, 5].map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">초기 자본 (원)</label>
          <input
            type="number"
            value={capital}
            onChange={e => setCapital(Number(e.target.value))}
            min={100_000}
            step={100_000}
            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-2">전략</label>
        <div className="flex flex-wrap gap-2">
          {STRATEGY_CATALOG.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStratChange(s.id as StrategyId)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                stratId === s.id
                  ? 'bg-brand text-white'
                  : 'bg-surface border border-surface-border text-slate-300 hover:border-brand'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">{strat.description}</p>
      </div>

      {strat.params.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {strat.params.map(p => (
            <div key={p.key}>
              <label className="block text-xs text-slate-400 mb-1">
                {p.label}: <span className="text-slate-200">{sparams[p.key]}</span>
              </label>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={sparams[p.key]}
                onChange={e => setSparams(prev => ({ ...prev, [p.key]: Number(e.target.value) }))}
                className="w-full accent-brand"
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="w-full py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
      >
        {loading ? '분석 중…' : '백테스트 실행'}
      </button>
    </form>
  );
}
