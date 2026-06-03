import Link from 'next/link';

export default function HomePage() {
  const steps = [
    { num: '1', title: '종목 입력', desc: '한국 주식 종목코드를 입력합니다. (예: 005930)' },
    { num: '2', title: '전략 선택', desc: '이동평균·RSI·MACD 등 5가지 전략 중 하나를 고릅니다.' },
    { num: '3', title: '결과 확인', desc: '자산곡선·수익률·MDD·승률을 즉시 시각화합니다.' },
  ];
  return (
    <div className="space-y-16">
      <section className="text-center py-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Backtest Studio
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
          코딩 없이 한국 주식 자동매매 전략을 과거 데이터로 검증하세요. 종목코드 하나면 충분합니다.
        </p>
        <Link href="/backtest" className="inline-block px-8 py-3 bg-brand hover:bg-brand-dark rounded-xl font-semibold text-lg transition-colors">
          백테스트 시작하기 →
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-6 text-center text-slate-200">이렇게 작동합니다</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="bg-surface-card border border-surface-border rounded-xl p-6">
              <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center font-bold text-sm mb-3">{num}</div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center">
        <p className="text-slate-400 text-sm">지원 전략: 이동평균 교차 · 변동성 돌파 · RSI 평균회귀 · MACD 교차 · 볼린저밴드</p>
        <Link href="/strategies" className="text-brand hover:underline text-sm mt-1 inline-block">전략 상세 설명 →</Link>
      </section>
    </div>
  );
}
