'use client';
import { useEffect, useRef } from 'react';
import type { EquityPoint } from '@/lib/backtest/types';

interface Props { data: EquityPoint[]; initialCapital: number; }

export default function EquityChart({ data, initialCapital }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;
    let chart: ReturnType<typeof import('lightweight-charts')['createChart']>;

    import('lightweight-charts').then(({ createChart, ColorType, LineSeries, AreaSeries }) => {
      chart = createChart(ref.current!, {
        layout: { background: { type: ColorType.Solid, color: '#1e293b' }, textColor: '#94a3b8' },
        grid: { vertLines: { color: '#334155' }, horzLines: { color: '#334155' } },
        width: ref.current!.clientWidth,
        height: 300,
      });

      // 기준선 (초기 자본)
      chart.addSeries(LineSeries, { color: '#64748b', lineStyle: 2, lineWidth: 1 }).setData(
        data.map(p => ({ time: p.date as `${number}-${number}-${number}`, value: initialCapital })),
      );

      chart.addSeries(AreaSeries, {
        lineColor: '#3b82f6',
        topColor: '#3b82f620',
        bottomColor: '#3b82f600',
      }).setData(
        data.map(p => ({ time: p.date as `${number}-${number}-${number}`, value: p.total })),
      );

      chart.timeScale().fitContent();
    });

    return () => { chart?.remove(); };
  }, [data, initialCapital]);

  return <div ref={ref} className="w-full rounded-lg overflow-hidden" />;
}
