import type { Candle, Signal, Strategy } from '../types';
import { macdLine } from '../indicators';

export class MACDStrategy implements Strategy {
  constructor(private fast = 12, private slow = 26, private signal = 9) {}

  generateSignals(candles: Candle[]): Signal[] {
    const macd = macdLine(candles.map(c => c.close), this.fast, this.slow, this.signal);
    const signals: Signal[] = candles.map(() => 0);
    for (let i = 1; i < macd.length; i++) {
      const prev = macd[i - 1].histogram, curr = macd[i].histogram;
      if (prev === null || curr === null) continue;
      if (prev <= 0 && curr > 0) signals[i] = 1;
      else if (prev >= 0 && curr < 0) signals[i] = -1;
    }
    return signals;
  }
}
