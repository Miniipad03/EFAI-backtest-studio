/** pandas rolling(window).mean()와 동일. 윈도 미만 인덱스는 null. */
export function sma(values: number[], window: number): (number | null)[] {
  if (window <= 0 || !Number.isInteger(window)) {
    throw new RangeError(`sma: window must be a positive integer, got ${window}`);
  }
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= window) sum -= values[i - window];
    out.push(i >= window - 1 ? sum / window : null);
  }
  return out;
}

/** 지수이동평균. period-1 까지는 null, period-1 인덱스는 SMA seed. */
export function ema(values: number[], period: number): (number | null)[] {
  if (period <= 0 || !Number.isInteger(period)) {
    throw new RangeError(`ema: period must be a positive integer, got ${period}`);
  }
  const k = 2 / (period + 1);
  const out: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period) return out;
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

/** Wilder RSI. 첫 period 인덱스까지는 null. */
export function rsi(values: number[], period: number): (number | null)[] {
  if (period <= 0 || !Number.isInteger(period)) {
    throw new RangeError(`rsi: period must be a positive integer, got ${period}`);
  }
  const out: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period + 1) return out;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i] - values[i - 1];
    if (d > 0) avgGain += d; else avgLoss -= d;
  }
  avgGain /= period;
  avgLoss /= period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

/** 볼린저밴드. period 미만 구간은 null. */
export function bollingerBands(
  values: number[],
  period = 20,
  stdDev = 2,
): { upper: number | null; middle: number | null; lower: number | null }[] {
  const middles = sma(values, period);
  return values.map((_, i) => {
    const m = middles[i];
    if (m === null) return { upper: null, middle: null, lower: null };
    const slice = values.slice(i - period + 1, i + 1);
    const variance = slice.reduce((acc, v) => acc + (v - m) ** 2, 0) / period;
    const sd = Math.sqrt(variance) * stdDev;
    return { upper: m + sd, middle: m, lower: m - sd };
  });
}

/** MACD 라인·시그널·히스토그램. slow 기간 전은 모두 null. */
export function macdLine(
  values: number[],
  fast = 12,
  slow = 26,
  signal = 9,
): { macd: number | null; signal: number | null; histogram: number | null }[] {
  const fastEma = ema(values, fast);
  const slowEma = ema(values, slow);
  const macdVals: (number | null)[] = values.map((_, i) => {
    const f = fastEma[i], s = slowEma[i];
    return f !== null && s !== null ? f - s : null;
  });
  const firstValid = macdVals.findIndex(v => v !== null);
  const sigLine: (number | null)[] = new Array(values.length).fill(null);
  if (firstValid >= 0) {
    const validSlice = macdVals.slice(firstValid) as number[];
    const sigEma = ema(validSlice, signal);
    sigEma.forEach((v, i) => { sigLine[firstValid + i] = v; });
  }
  return values.map((_, i) => {
    const m = macdVals[i], s = sigLine[i];
    return { macd: m, signal: s, histogram: m !== null && s !== null ? m - s : null };
  });
}
