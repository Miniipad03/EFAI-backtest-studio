import { describe, it, expect } from 'vitest';
import { sma } from './indicators';

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
