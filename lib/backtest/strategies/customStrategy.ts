import type { Candle, Signal, Strategy } from '../types';
import { sma, rsi, bollingerBands, macdLine } from '../indicators';

export type ConditionKind =
  | 'rsi_below'
  | 'rsi_above'
  | 'price_cross_above_sma'
  | 'price_cross_below_sma'
  | 'macd_hist_turns_positive'
  | 'macd_hist_turns_negative'
  | 'close_below_bb_lower'
  | 'close_above_bb_upper';

export interface CustomRule {
  kind: ConditionKind;
  params: Record<string, number>;
  action: 'buy' | 'sell';
}

/** 빌더 UI에서 사용하는 조건 블록 정의 */
export interface ConditionDef {
  kind: ConditionKind;
  label: string;
  params: { key: string; label: string; default: number; min: number; max: number; step: number }[];
}

export const CONDITION_DEFS: ConditionDef[] = [
  {
    kind: 'rsi_below', label: 'RSI가 기준값 아래로',
    params: [
      { key: 'period', label: '기간', default: 14, min: 2, max: 50, step: 1 },
      { key: 'threshold', label: '기준값', default: 30, min: 5, max: 95, step: 1 },
    ],
  },
  {
    kind: 'rsi_above', label: 'RSI가 기준값 위로',
    params: [
      { key: 'period', label: '기간', default: 14, min: 2, max: 50, step: 1 },
      { key: 'threshold', label: '기준값', default: 70, min: 5, max: 95, step: 1 },
    ],
  },
  {
    kind: 'price_cross_above_sma', label: '종가가 SMA 상향돌파',
    params: [{ key: 'period', label: 'SMA 기간', default: 20, min: 2, max: 200, step: 1 }],
  },
  {
    kind: 'price_cross_below_sma', label: '종가가 SMA 하향돌파',
    params: [{ key: 'period', label: 'SMA 기간', default: 20, min: 2, max: 200, step: 1 }],
  },
  { kind: 'macd_hist_turns_positive', label: 'MACD 히스토그램 양전환', params: [] },
  { kind: 'macd_hist_turns_negative', label: 'MACD 히스토그램 음전환', params: [] },
  {
    kind: 'close_below_bb_lower', label: '종가가 볼린저 하단 이하',
    params: [
      { key: 'period', label: '기간', default: 20, min: 5, max: 50, step: 1 },
      { key: 'stdDev', label: '표준편차 배수', default: 2, min: 1, max: 3, step: 0.5 },
    ],
  },
  {
    kind: 'close_above_bb_upper', label: '종가가 볼린저 상단 이상',
    params: [
      { key: 'period', label: '기간', default: 20, min: 5, max: 50, step: 1 },
      { key: 'stdDev', label: '표준편차 배수', default: 2, min: 1, max: 3, step: 0.5 },
    ],
  },
];

/** 조건 1개를 캔들 전체에 대해 평가 → 각 인덱스 매칭 여부 */
function evaluateCondition(rule: CustomRule, candles: Candle[]): boolean[] {
  const closes = candles.map(c => c.close);
  const n = candles.length;
  const out = new Array<boolean>(n).fill(false);

  switch (rule.kind) {
    case 'rsi_below': {
      const r = rsi(closes, rule.params.period);
      for (let i = 0; i < n; i++) out[i] = r[i] !== null && (r[i] as number) < rule.params.threshold;
      return out;
    }
    case 'rsi_above': {
      const r = rsi(closes, rule.params.period);
      for (let i = 0; i < n; i++) out[i] = r[i] !== null && (r[i] as number) > rule.params.threshold;
      return out;
    }
    case 'price_cross_above_sma': {
      const s = sma(closes, rule.params.period);
      for (let i = 1; i < n; i++) {
        out[i] = s[i - 1] !== null && s[i] !== null &&
          closes[i - 1] <= (s[i - 1] as number) && closes[i] > (s[i] as number);
      }
      return out;
    }
    case 'price_cross_below_sma': {
      const s = sma(closes, rule.params.period);
      for (let i = 1; i < n; i++) {
        out[i] = s[i - 1] !== null && s[i] !== null &&
          closes[i - 1] >= (s[i - 1] as number) && closes[i] < (s[i] as number);
      }
      return out;
    }
    case 'macd_hist_turns_positive': {
      const m = macdLine(closes);
      for (let i = 1; i < n; i++) {
        const prev = m[i - 1].histogram, cur = m[i].histogram;
        out[i] = prev !== null && cur !== null && prev <= 0 && cur > 0;
      }
      return out;
    }
    case 'macd_hist_turns_negative': {
      const m = macdLine(closes);
      for (let i = 1; i < n; i++) {
        const prev = m[i - 1].histogram, cur = m[i].histogram;
        out[i] = prev !== null && cur !== null && prev >= 0 && cur < 0;
      }
      return out;
    }
    case 'close_below_bb_lower': {
      const bb = bollingerBands(closes, rule.params.period, rule.params.stdDev);
      for (let i = 0; i < n; i++) {
        out[i] = bb[i].lower !== null && closes[i] <= (bb[i].lower as number);
      }
      return out;
    }
    case 'close_above_bb_upper': {
      const bb = bollingerBands(closes, rule.params.period, rule.params.stdDev);
      for (let i = 0; i < n; i++) {
        out[i] = bb[i].upper !== null && closes[i] >= (bb[i].upper as number);
      }
      return out;
    }
  }
}

/**
 * 블록 빌더로 조립한 규칙 목록을 실행하는 전략.
 * 같은 날 여러 규칙이 매칭되면 먼저 정의된 규칙이 우선한다.
 */
export class CustomStrategy implements Strategy {
  constructor(private rules: CustomRule[]) {}

  generateSignals(candles: Candle[]): Signal[] {
    const evaluated = this.rules.map(r => ({
      action: r.action,
      matched: evaluateCondition(r, candles),
    }));
    return candles.map((_, i) => {
      for (const e of evaluated) {
        if (e.matched[i]) return e.action === 'buy' ? 1 : -1;
      }
      return 0;
    });
  }
}
