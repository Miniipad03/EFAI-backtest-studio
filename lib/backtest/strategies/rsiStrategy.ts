import type { Candle, Signal, Strategy } from '../types';
import { rsi } from '../indicators';

export class RSIStrategy implements Strategy {
  constructor(private period = 14, private oversold = 30, private overbought = 70) {}

  generateSignals(candles: Candle[]): Signal[] {
    const rsiVals = rsi(candles.map(c => c.close), this.period);
    return rsiVals.map(v => {
      if (v === null) return 0;
      if (v < this.oversold) return 1;
      if (v > this.overbought) return -1;
      return 0;
    });
  }
}
