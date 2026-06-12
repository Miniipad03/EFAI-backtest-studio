# Backtest Studio

한국 주식 자동매매 전략 백테스팅 웹 서비스.

**🔗 [라이브 데모](https://backtest-studio.vercel.app)**

## 주요 기능

- **종목명 검색 자동완성** — KRX 전체 2,875종목 이름/코드 검색 + 인기 10종목 원클릭 선택
- 한국 주식 실시간 OHLCV 데이터 조회 (FinanceDataReader / KRX, API 키 불필요)
- **5가지 프리셋 전략** 백테스팅: 이동평균 교차 · 변동성 돌파 · RSI 평균회귀 · MACD 교차 · 볼린저밴드
- **🧩 블록 스타일 커스텀 전략 빌더** — 지표 조건 블록 + 매수/매도 동작 블록 조립
- 자산곡선 차트 + **Buy & Hold 벤치마크 비교** (lightweight-charts v5)
- **주가 캔들차트 + 매수/매도 시점 마커** — 전략이 언제 사고팔았는지 시각화
- 성과지표 카드 (설명 툴팁 포함): 총수익률 · CAGR · 샤프비율 · MDD · 승률 · 거래횟수 · Buy&Hold 대비
- 매매내역 테이블 (매도 거래 기준)
- 인기 10종목 정적 캐시 폴백 (API 장애 대응) + 단계별 로딩 안내

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| 차트 | lightweight-charts v5 (TradingView) |
| 계산 엔진 | 브라우저 TS — 전략·백테스트·지표 모두 클라이언트 실행 |
| 데이터 API | Vercel Python 서버리스 + FinanceDataReader |
| 테스트 | Vitest (36 tests) |
| 배포 | Vercel |

## 로컬 실행

```bash
npm install
npm run dev
# → http://localhost:3000
```

인기종목 정적 캐시 재생성:
```bash
pip install FinanceDataReader pandas
python scripts/fetch_cache.py
```

## 테스트

```bash
npm test
# 36 tests, 8 test files — all passing
```

테스트 범위: SMA·EMA·RSI·Bollinger·MACD 지표 / MA교차·변동성돌파·RSI·MACD·Bollinger·커스텀 전략 / 백테스트 엔진 비용모델 / 성과지표 계산

## 기술적 특징

**브라우저 사이드 백테스팅**: 모든 전략·엔진·지표 계산이 클라이언트 TypeScript에서 실행됩니다.

**기존 봇 로직 포팅**: Python `auto-trade-bot`의 `engine.py`, `metrics.py`, `ma_cross.py`, `volatility_breakout.py` 로직을 TypeScript로 1:1 포팅했습니다.

**이중 데이터 레이어**: `/api/ohlcv`(Python 서버리스 + FinanceDataReader) 1차, `public/data/*.json`(10종목 정적 캐시) 폴백. API 키 없이 KRX 실시간 데이터 접근.

## 과제 정보

- **과목**: KENTECH EF2039 Introduction to AI Programming (2026 Spring)
- **과제**: Assignment 4 — PRD Document & AI-Assisted Web Service Implementation
- **마감**: 2026-06-14
