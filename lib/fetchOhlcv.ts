import type { Candle } from './backtest/types';

export interface OhlcvResponse {
  code: string;
  name: string;
  candles: Candle[];
}

/**
 * 종목코드로 OHLCV 데이터 조회.
 * 1차: /api/ohlcv (Python 서버리스)
 * 2차 폴백: /data/<code>.json (정적 캐시)
 */
export async function fetchOhlcv(code: string, years = 3): Promise<OhlcvResponse> {
  const trimmed = code.trim().replace(/[^0-9A-Za-z]/g, '');
  if (!trimmed) throw new Error('종목코드를 입력하세요.');

  // 1차: API
  try {
    const res = await fetch(
      `/api/ohlcv?code=${encodeURIComponent(trimmed)}&years=${years}`,
      { signal: AbortSignal.timeout(20_000) },
    );
    if (res.ok) {
      const data: OhlcvResponse = await res.json();
      if (data.candles?.length > 0) return data;
    }
    if (res.status === 404) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? `종목 '${trimmed}'를 찾을 수 없습니다.`);
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('찾을 수 없')) throw err;
    // 타임아웃·네트워크 오류 → 정적 폴백
  }

  // 2차: 정적 캐시
  const staticRes = await fetch(`/data/${trimmed}.json`).catch(() => null);
  if (staticRes?.ok) {
    const data: OhlcvResponse = await staticRes.json();
    if (data.candles?.length > 0) return data;
  }

  throw new Error(
    `'${trimmed}' 데이터를 불러오지 못했습니다. 종목코드를 확인하거나 잠시 후 다시 시도하세요.`,
  );
}
