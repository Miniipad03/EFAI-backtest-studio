import type { Candle, Signal, Strategy } from '../types';

export class VolatilityBreakout implements Strategy {
  constructor(private k = 0.5) {}

  generateSignals(candles: Candle[]): Signal[] {
    const signals: Signal[] = candles.map(() => 0);
    for (let i = 1; i < candles.length; i++) {
      const prevRange = candles[i - 1].high - candles[i - 1].low;
      const target = candles[i].open + prevRange * this.k;
      if (candles[i].high >= target) signals[i] = 1;
    }
    return signals;
  }
}
