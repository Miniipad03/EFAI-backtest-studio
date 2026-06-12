'use client';
import { useEffect, useRef } from 'react';
import type { EquityPoint } from '@/lib/backtest/types';

interface Props {
  data: EquityPoint[];
  initialCapital: number;
  /** Buy & Hold 벤치마크 곡선 (같은 기간 단순 보유 시 자산) */
  benchmark?: { date: string; value: number }[];
}

type ChartDate = `${number}-${number}-${number}`;

export default function EquityChart({ data, initialCapital, benchmark }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;
    let chart: ReturnType<typeof import('lightweight-charts')['createChart']>;
    let observer: ResizeObserver | undefined;

    import('lightweight-charts').then(({ createChart, ColorType, LineSeries, AreaSeries }) => {
      if (!ref.current) return;
      chart = createChart(ref.current, {
        layout: { background: { type: ColorType.Solid, color: '#1e293b' }, textColor: '#94a3b8' },
        grid: { vertLines: { color: '#334155' }, horzLines: { color: '#334155' } },
        width: ref.current.clientWidth,
        height: 300,
      });

      // 기준선 (초기 자본)
      chart.addSeries(LineSeries, { color: '#64748b', lineStyle: 2, lineWidth: 1 }).setData(
        data.map(p => ({ time: p.date as ChartDate, value: initialCapital })),
      );

      // Buy & Hold 벤치마크
      if (benchmark && benchmark.length > 0) {
        chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1 }).setData(
          benchmark.map(p => ({ time: p.date as ChartDate, value: p.value })),
        );
      }

      // 전략 자산곡선
      chart.addSeries(AreaSeries, {
        lineColor: '#3b82f6',
        topColor: '#3b82f620',
        bottomColor: '#3b82f600',
      }).setData(
        data.map(p => ({ time: p.date as ChartDate, value: p.total })),
      );

      chart.timeScale().fitContent();

      observer = new ResizeObserver(entries => {
        const w = entries[0]?.contentRect.width;
        if (w) chart.applyOptions({ width: w });
      });
      observer.observe(ref.current);
    });

    return () => {
      observer?.disconnect();
      chart?.remove();
    };
  }, [data, initialCapital, benchmark]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-2 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-brand" /> 전략 자산
        </span>
        {benchmark && benchmark.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-amber-500" /> 단순 보유 (Buy &amp; Hold)
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-slate-500" /> 초기 자본
        </span>
      </div>
      <div ref={ref} className="w-full rounded-lg overflow-hidden" />
    </div>
  );
}
