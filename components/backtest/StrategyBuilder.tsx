'use client';
import { CONDITION_DEFS, type ConditionKind, type CustomRule } from '@/lib/backtest/strategies/customStrategy';

interface Props {
  rules: CustomRule[];
  onChange: (rules: CustomRule[]) => void;
}

function defaultParams(kind: ConditionKind): Record<string, number> {
  const def = CONDITION_DEFS.find(d => d.kind === kind)!;
  return Object.fromEntries(def.params.map(p => [p.key, p.default]));
}

export function defaultRules(): CustomRule[] {
  return [
    { kind: 'rsi_below', params: defaultParams('rsi_below'), action: 'buy' },
    { kind: 'rsi_above', params: defaultParams('rsi_above'), action: 'sell' },
  ];
}

/** 스크래치 느낌의 블록 조립식 전략 빌더 — 조건 블록(노랑) + 동작 블록(초록/빨강) */
export default function StrategyBuilder({ rules, onChange }: Props) {
  const update = (i: number, rule: CustomRule) =>
    onChange(rules.map((r, j) => (j === i ? rule : r)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rules.length) return;
    const next = [...rules];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const hasBuy = rules.some(r => r.action === 'buy');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          규칙 블록 — 위에 있는 규칙이 우선 적용됩니다
        </p>
        <button
          type="button"
          onClick={() =>
            onChange([...rules, { kind: 'rsi_below', params: defaultParams('rsi_below'), action: 'buy' }])
          }
          className="px-2.5 py-1 rounded-md text-xs bg-surface border border-surface-border text-slate-300 hover:border-brand"
        >
          + 규칙 추가
        </button>
      </div>

      {rules.length === 0 && (
        <p className="text-sm text-slate-500 border border-dashed border-surface-border rounded-lg p-4 text-center">
          규칙이 없습니다. &ldquo;+ 규칙 추가&rdquo;를 눌러 첫 블록을 만들어 보세요.
        </p>
      )}

      {rules.map((rule, i) => {
        const def = CONDITION_DEFS.find(d => d.kind === rule.kind)!;
        return (
          <div
            key={i}
            className="flex flex-wrap items-center gap-2 bg-surface rounded-lg p-3 border border-surface-border"
          >
            <span className="text-xs text-slate-500 font-mono w-5">{i + 1}.</span>

            {/* 조건 블록 (노랑) */}
            <div className="flex flex-wrap items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 rounded-lg px-2.5 py-1.5">
              <span className="text-xs font-semibold text-amber-400">만약</span>
              <select
                value={rule.kind}
                onChange={e => {
                  const kind = e.target.value as ConditionKind;
                  update(i, { ...rule, kind, params: defaultParams(kind) });
                }}
                className="bg-surface border border-surface-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-brand"
              >
                {CONDITION_DEFS.map(d => (
                  <option key={d.kind} value={d.kind}>{d.label}</option>
                ))}
              </select>
              {def.params.map(p => (
                <label key={p.key} className="flex items-center gap-1 text-xs text-slate-400">
                  {p.label}
                  <input
                    type="number"
                    value={rule.params[p.key]}
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    onChange={e =>
                      update(i, { ...rule, params: { ...rule.params, [p.key]: Number(e.target.value) } })
                    }
                    className="w-16 bg-surface border border-surface-border rounded-md px-1.5 py-1 text-xs focus:outline-none focus:border-brand"
                  />
                </label>
              ))}
              <span className="text-xs font-semibold text-amber-400">이면</span>
            </div>

            <span className="text-slate-500 text-sm">→</span>

            {/* 동작 블록 (초록/빨강) */}
            <button
              type="button"
              onClick={() => update(i, { ...rule, action: rule.action === 'buy' ? 'sell' : 'buy' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                rule.action === 'buy'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-red-500/15 border-red-500/40 text-red-400'
              }`}
              title="클릭하면 매수/매도가 바뀝니다"
            >
              {rule.action === 'buy' ? '매수' : '매도'}
            </button>

            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                className="px-1.5 py-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30">▲</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rules.length - 1}
                className="px-1.5 py-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30">▼</button>
              <button type="button" onClick={() => onChange(rules.filter((_, j) => j !== i))}
                className="px-1.5 py-1 text-xs text-red-400/70 hover:text-red-400">✕</button>
            </div>
          </div>
        );
      })}

      {rules.length > 0 && !hasBuy && (
        <p className="text-xs text-amber-400">
          ⚠ 매수 규칙이 없으면 거래가 발생하지 않습니다. 규칙 하나를 매수로 바꿔 보세요.
        </p>
      )}
    </div>
  );
}
