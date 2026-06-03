import type { Candle, Signal, Strategy } from '../types';
import { sma } from '../indicators';

export class MaCross implements Strategy {
  constructor(private short = 5, private long = 20) {}

  generateSignals(candles: Candle[]): Signal[] {
    const closes = candles.map((c) => c.close);
    const shortMa = sma(closes, this.short);
    const longMa = sma(closes, this.long);
    const signals: Signal[] = closes.map(() => 0);

    for (let i = 1; i < closes.length; i++) {
      const s = shortMa[i], l = longMa[i];
      const ps = shortMa[i - 1], pl = longMa[i - 1];
      if (s === null || l === null || ps === null || pl === null) continue;

      if (ps <= pl && s > l) signals[i] = 1;       // 골든크로스
      else if (ps >= pl && s < l) signals[i] = -1; // 데드크로스
    }
    return signals;
  }
}
