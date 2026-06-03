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
