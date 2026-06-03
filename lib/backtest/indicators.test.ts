import { describe, it, expect } from 'vitest';
import { sma, ema, rsi, bollingerBands, macdLine } from './indicators';

describe('sma', () => {
  it('윈도 미만 구간은 null, 이후 이동평균', () => {
    const result = sma([1, 2, 3, 4, 5], 3);
    expect(result).toEqual([null, null, 2, 3, 4]);
  });

  it('윈도가 1이면 입력과 동일', () => {
    expect(sma([10, 20], 1)).toEqual([10, 20]);
  });

  it('윈도가 데이터 길이보다 크면 전부 null', () => {
    expect(sma([1, 2], 5)).toEqual([null, null]);
  });

  it('윈도가 0 이하면 RangeError', () => {
    expect(() => sma([1, 2, 3], 0)).toThrow(RangeError);
  });
});

describe('ema', () => {
  it('period-1 까지는 null, 이후 지수이동평균', () => {
    const result = ema([1, 2, 3, 4, 5], 3);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).toBeCloseTo(2, 6);
    expect(result[3]).toBeCloseTo(3, 6);
    expect(result[4]).toBeCloseTo(4, 6);
  });
  it('period <= 0 이면 RangeError', () => {
    expect(() => ema([1, 2, 3], 0)).toThrow(RangeError);
  });
});

describe('rsi', () => {
  it('period+1 미만 데이터면 전부 null', () => {
    const r = rsi([1, 2, 3], 14);
    expect(r.every(v => v === null)).toBe(true);
  });
  it('모두 상승하면 RSI > 90에 수렴', () => {
    const values = Array.from({ length: 20 }, (_, i) => i + 1);
    expect(rsi(values, 14)[19]!).toBeGreaterThan(90);
  });
  it('period <= 0 이면 RangeError', () => {
    expect(() => rsi([1, 2, 3], 0)).toThrow(RangeError);
  });
});

describe('bollingerBands', () => {
  it('period 미만 구간은 middle=null', () => {
    const result = bollingerBands([1, 2, 3, 4, 5], 3);
    expect(result[0].middle).toBeNull();
    expect(result[2].middle).toBeCloseTo(2, 6);
  });
  it('upper > middle > lower (분산 > 0 구간)', () => {
    const vals = [10, 11, 12, 11, 10, 11, 12];
    const last = bollingerBands(vals, 3)[vals.length - 1];
    expect(last.upper!).toBeGreaterThan(last.middle!);
    expect(last.middle!).toBeGreaterThan(last.lower!);
  });
});

describe('macdLine', () => {
  it('slow 기간 전은 macd=null, 이후 non-null', () => {
    const vals = Array.from({ length: 40 }, (_, i) => 100 + (i % 5));
    const result = macdLine(vals, 12, 26, 9);
    expect(result[0].macd).toBeNull();
    expect(result[25].macd).not.toBeNull();
  });
});
