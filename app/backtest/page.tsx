'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import BacktestForm from '@/components/backtest/BacktestForm';
import MetricsCards from '@/components/backtest/MetricsCards';
import TradesTable from '@/components/backtest/TradesTable';
import { fetchOhlcv } from '@/lib/fetchOhlcv';
import { buildStrategy, type StrategyId } from '@/lib/backtest/strategies/index';
import { runBacktest } from '@/lib/backtest/engine';
import type { BacktestResult } from '@/lib/backtest/types';

const EquityChart = dynamic(() => import('@/components/backtest/EquityChart'), { ssr: false });

interface FormParams {
  code: string;
  years: number;
  initialCapital: number;
  strategyId: StrategyId;
  strategyParams: Record<string, number>;
}

export default function BacktestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [stockName, setStockName] = useState('');
  const [capital, setCapital] = useState(10_000_000);

  const handleSubmit = async (params: FormParams) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCapital(params.initialCapital);
    try {
      const ohlcv = await fetchOhlcv(params.code, params.years);
      setStockName(ohlcv.name);
      const strategy = buildStrategy(params.strategyId, params.strategyParams);
      const signals = strategy.generateSignals(ohlcv.candles);
      setResult(runBacktest(ohlcv.candles, signals, params.initialCapital));
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">백테스트</h1>
        <p className="text-slate-400 text-sm">
          종목·전략·기간을 설정하고 과거 데이터로 매매 성과를 시뮬레이션합니다.
        </p>
      </div>

      <BacktestForm onSubmit={handleSubmit} loading={loading} />

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
          <EquityChart data={result.equityCurve} initialCapital={capital} />
          <MetricsCards metrics={result.metrics} />
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">매매내역 (매도 기준)</h3>
            <TradesTable trades={result.trades} />
          </div>
        </div>
      )}
    </div>
  );
}
