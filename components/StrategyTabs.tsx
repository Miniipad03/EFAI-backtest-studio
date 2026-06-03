'use client';
import { useState } from 'react';
import { STRATEGY_CATALOG } from '@/lib/backtest/strategies/index';

export default function StrategyTabs() {
  const [active, setActive] = useState(STRATEGY_CATALOG[0].id);
  const strat = STRATEGY_CATALOG.find(s => s.id === active)!;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STRATEGY_CATALOG.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active === s.id ? 'bg-brand text-white' : 'bg-surface-card border border-surface-border text-slate-300 hover:border-brand'}`}>
            {s.name}
          </button>
        ))}
      </div>
      <div className="bg-surface-card border border-surface-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold">{strat.name}</h2>
        <p className="text-slate-300">{strat.description}</p>
        {strat.params.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">파라미터</h3>
            <table className="text-sm w-full">
              <thead><tr className="border-b border-surface-border text-slate-400">
                <th className="text-left py-2">이름</th>
                <th className="text-right py-2">기본값</th>
                <th className="text-right py-2">범위</th>
              </tr></thead>
              <tbody>
                {strat.params.map(p => (
                  <tr key={p.key} className="border-b border-surface-border/50">
                    <td className="py-2 text-slate-200">{p.label}</td>
                    <td className="py-2 text-right text-brand">{p.default}</td>
                    <td className="py-2 text-right text-slate-400">{p.min} ~ {p.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
