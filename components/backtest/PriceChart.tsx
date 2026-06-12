'use client';
import { useEffect, useRef } from 'react';
import type { Candle, Trade } from '@/lib/backtest/types';

interface Props {
  candles: Candle[];
  trades: Trade[];
}

type ChartDate = `${number}-${number}-${number}`;

/** 주가 캔들차트 + 매수/매도 시점 마커. 한국 관례: 상승 빨강, 하락 파랑. */
export default function PriceChart({ candles, trades }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || candles.length === 0) return;
    let chart: ReturnType<typeof import('lightweight-charts')['createChart']>;
    let observer: ResizeObserver | undefined;

    import('lightweight-charts').then(({ createChart, ColorType, CandlestickSeries, createSeriesMarkers }) => {
      if (!ref.current) return;
      chart = createChart(ref.current, {
        layout: { background: { type: ColorType.Solid, color: '#1e293b' }, textColor: '#94a3b8' },
        grid: { vertLines: { color: '#334155' }, horzLines: { color: '#334155' } },
        width: ref.current.clientWidth,
        height: 320,
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#ef4444', borderUpColor: '#ef4444', wickUpColor: '#ef4444',
        downColor: '#3b82f6', borderDownColor: '#3b82f6', wickDownColor: '#3b82f6',
      });
      series.setData(
        candles.map(c => ({
          time: c.date as ChartDate,
          open: c.open, high: c.high, low: c.low, close: c.close,
        })),
      );

      createSeriesMarkers(
        series,
        trades.map(t =>
          t.side === 'buy'
            ? {
                time: t.date as ChartDate,
                position: 'belowBar' as const,
                color: '#10b981',
                shape: 'arrowUp' as const,
                text: trades.length <= 40 ? '매수' : 'B',
              }
            : {
                time: t.date as ChartDate,
                position: 'aboveBar' as const,
                color: '#f59e0b',
                shape: 'arrowDown' as const,
                text: trades.length <= 40 ? '매도' : 'S',
              },
        ),
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
  }, [candles, trades]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-2 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> 매수 시점
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> 매도 시점
        </span>
      </div>
      <div ref={ref} className="w-full rounded-lg overflow-hidden" />
    </div>
  );
}
