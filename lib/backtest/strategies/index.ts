import { MaCross } from './maCross';
import { VolatilityBreakout } from './volatilityBreakout';
import { RSIStrategy } from './rsiStrategy';
import { MACDStrategy } from './macdStrategy';
import { BollingerBandStrategy } from './bollingerBandStrategy';
import { CustomStrategy, type CustomRule } from './customStrategy';
import type { Strategy } from '../types';

export type StrategyId = 'ma_cross' | 'volatility_breakout' | 'rsi' | 'macd' | 'bollinger' | 'custom';

export interface StrategyParam {
  key: string; label: string; type: 'number';
  default: number; min: number; max: number; step: number;
}

export interface StrategyMeta {
  id: StrategyId; name: string; description: string; params: StrategyParam[];
}

export const STRATEGY_CATALOG: StrategyMeta[] = [
  {
    id: 'ma_cross', name: '이동평균 교차',
    description: '단기 SMA가 장기 SMA를 상향돌파하면 매수(골든크로스), 하향돌파하면 매도(데드크로스).',
    params: [
      { key: 'short', label: '단기 기간', type: 'number', default: 5, min: 2, max: 50, step: 1 },
      { key: 'long', label: '장기 기간', type: 'number', default: 20, min: 5, max: 200, step: 1 },
    ],
  },
  {
    id: 'volatility_breakout', name: '변동성 돌파',
    description: '전일 변동폭 × k를 당일 시가에 더한 목표가를 고가가 돌파하면 매수.',
    params: [
      { key: 'k', label: 'k (변동폭 계수)', type: 'number', default: 0.5, min: 0.1, max: 1.0, step: 0.05 },
    ],
  },
  {
    id: 'rsi', name: 'RSI 평균회귀',
    description: 'RSI가 과매도(기본 30) 이하이면 매수, 과매수(기본 70) 이상이면 매도.',
    params: [
      { key: 'period', label: '기간', type: 'number', default: 14, min: 2, max: 50, step: 1 },
      { key: 'oversold', label: '과매도 기준', type: 'number', default: 30, min: 10, max: 45, step: 1 },
      { key: 'overbought', label: '과매수 기준', type: 'number', default: 70, min: 55, max: 90, step: 1 },
    ],
  },
  {
    id: 'macd', name: 'MACD 교차',
    description: 'MACD 히스토그램이 음→양 전환 시 매수, 양→음 전환 시 매도.',
    params: [
      { key: 'fast', label: '단기 EMA', type: 'number', default: 12, min: 3, max: 30, step: 1 },
      { key: 'slow', label: '장기 EMA', type: 'number', default: 26, min: 10, max: 60, step: 1 },
      { key: 'signal', label: '시그널 EMA', type: 'number', default: 9, min: 3, max: 20, step: 1 },
    ],
  },
  {
    id: 'bollinger', name: '볼린저밴드',
    description: '종가가 하단 밴드에 닿으면 매수, 상단 밴드에 닿으면 매도.',
    params: [
      { key: 'period', label: '기간', type: 'number', default: 20, min: 5, max: 50, step: 1 },
      { key: 'stdDev', label: '표준편차 배수', type: 'number', default: 2, min: 1, max: 3, step: 0.5 },
    ],
  },
  {
    id: 'custom', name: '🧩 직접 만들기',
    description: '지표 조건 블록과 매수/매도 동작 블록을 조립해 나만의 전략을 만듭니다. 같은 날 여러 조건이 맞으면 위에 있는 규칙이 우선합니다.',
    params: [],
  },
];

export function buildStrategy(
  id: StrategyId,
  params: Record<string, number>,
  customRules?: CustomRule[],
): Strategy {
  switch (id) {
    case 'ma_cross': return new MaCross(params.short, params.long);
    case 'volatility_breakout': return new VolatilityBreakout(params.k);
    case 'rsi': return new RSIStrategy(params.period, params.oversold, params.overbought);
    case 'macd': return new MACDStrategy(params.fast, params.slow, params.signal);
    case 'bollinger': return new BollingerBandStrategy(params.period, params.stdDev);
    case 'custom': return new CustomStrategy(customRules ?? []);
  }
}
