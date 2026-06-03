import type { Candle, Signal, Strategy } from '../types';
import { bollingerBands } from '../indicators';

export class BollingerBandStrategy implements Strategy {
  constructor(private period = 20, private stdDev = 2) {}

  generateSignals(candles: Candle[]): Signal[] {
    const closes = candles.map(c => c.close);
    const bands = bollingerBands(closes, this.period, this.stdDev);
    return bands.map(({ upper, lower }, i) => {
      if (upper === null || lower === null) return 0;
      if (closes[i] <= lower) return 1;
      if (closes[i] >= upper) return -1;
      return 0;
    });
  }
}
