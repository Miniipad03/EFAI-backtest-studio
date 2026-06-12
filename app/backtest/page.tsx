'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import BacktestForm, { type FormParams } from '@/components/backtest/BacktestForm';
import MetricsCards from '@/components/backtest/MetricsCards';
import TradesTable from '@/components/backtest/TradesTable';
import { fetchOhlcv } from '@/lib/fetchOhlcv';
import { buildStrategy } from '@/lib/backtest/strategies/index';
import { runBacktest } from '@/lib/backtest/engine';
import type { BacktestResult, Candle } from '@/lib/backtest/types';

const EquityChart = dynamic(() => import('@/components/backtest/EquityChart'), { ssr: false });
const PriceChart = dynamic(() => import('@/components/backtest/PriceChart'), { ssr: false });

type Stage = 'idle' | 'fetch' | 'compute';

const STAGE_MESSAGES: Record<Exclude<Stage, 'idle'>, string> = {
  fetch: '시세 데이터를 불러오는 중… 첫 요청은 서버가 깨어나느라 5~10초 걸릴 수 있어요.',
  compute: '신호 계산 및 매매 시뮬레이션 중…',
};

export default function BacktestPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [stockName, setStockName] = useState('');
  const [capital, setCapital] = useState(10_000_000);

  const loading = stage !== 'idle';

  const handleSubmit = async (params: FormParams) => {
    setStage('fetch');
    setError(null);
    setResult(null);
    setCapital(params.initialCapital);
    try {
      const ohlcv = await fetchOhlcv(params.code, params.years);
      setStage('compute');
      setStockName(ohlcv.name || params.name || params.code);
      setCandles(ohlcv.candles);
      const strategy = buildStrategy(params.strategyId, params.strategyParams, params.customRules);
      const signals = strategy.generateSignals(ohlcv.candles);
      setResult(runBacktest(ohlcv.candles, signals, params.initialCapital));
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setStage('idle');
    }
  };

  // 같은 기간 단순 보유(Buy & Hold) 벤치마크
  const benchmark =
    candles.length > 0
      ? candles.map(c => ({ date: c.date, value: (capital * c.close) / candles[0].close }))
      : [];
  const benchmarkReturn =
    candles.length > 0 ? candles[candles.length - 1].close / candles[0].close - 1 : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">백테스트</h1>
        <p className="text-slate-400 text-sm">
          종목·전략·기간을 설정하고 과거 데이터로 매매 성과를 시뮬레이션합니다.
        </p>
      </div>

      <BacktestForm onSubmit={handleSubmit} loading={loading} />

      {loading && (
        <div className="flex items-center gap-3 bg-surface-card border border-surface-border rounded-lg px-4 py-3 text-sm text-slate-300">
          <span className="inline-block w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          {STAGE_MESSAGES[stage as Exclude<Stage, 'idle'>]}
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">결과 — {stockName}</h2>
            <span className="text-xs text-slate-400">
              {result.equityCurve[0]?.date} ~ {result.equityCurve[result.equityCurve.length - 1]?.date}
            </span>
          </div>

          <MetricsCards metrics={result.metrics} benchmarkReturn={benchmarkReturn} />

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">자산 곡선</h3>
            <EquityChart data={result.equityCurve} initialCapital={capital} benchmark={benchmark} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">주가 차트 · 매매 시점</h3>
            <PriceChart candles={candles} trades={result.trades} />
          </div>

          {result.trades.length === 0 && (
            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg px-4 py-3 text-amber-300 text-sm">
              이 기간에는 전략 조건을 만족하는 거래가 발생하지 않았습니다. 파라미터를 조정하거나
              기간을 늘려 보세요.
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">매매내역 (매도 기준)</h3>
            <TradesTable trades={result.trades} />
          </div>
        </div>
      )}
    </div>
  );
}
