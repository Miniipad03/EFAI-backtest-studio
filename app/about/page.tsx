export default function AboutPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">About</h1>
        <p className="text-slate-400 text-sm">프로젝트 소개 및 실전 트레이딩 안내</p>
      </div>
      <section className="bg-surface-card border border-surface-border rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-lg">프로젝트 소개</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Backtest Studio는 KENTECH EF2039 Introduction to AI Programming 과제로 제작되었습니다.
          기존 Python 자동매매 봇(<code className="text-brand">auto-trade-bot</code>)의 전략·백테스트 엔진을
          TypeScript로 포팅해 브라우저에서 직접 실행합니다. 데이터는 FinanceDataReader를 통해 KRX에서 실시간 조회합니다.
        </p>
      </section>
      <section className="bg-surface-card border border-surface-border rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-lg">실전 자동매매로 전환하려면</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          이 웹 서비스는 백테스트(과거 데이터 시뮬레이션)만 제공합니다. 실제 계좌 자동매매는 로컬 Python 봇을 사용하세요:
        </p>
        <ol className="text-slate-400 text-sm list-decimal list-inside space-y-1">
          <li>한국투자증권(KIS) 모의투자 계좌로 최소 4주 검증</li>
          <li><code className="text-brand">auto-trade-bot</code> 레포 클론 후 .env 설정</li>
          <li><code className="text-brand">uv run python scripts/run_paper.py</code> 로 모의 실행</li>
          <li>4주 검증 후 실전 계좌 전환</li>
        </ol>
      </section>
      <section className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-6">
        <h2 className="font-semibold text-amber-400 mb-2">⚠️ 투자 주의사항</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          이 서비스는 교육 목적으로만 제공됩니다. 과거 성과가 미래 수익을 보장하지 않으며,
          실제 투자로 인한 손실에 대해 책임지지 않습니다.
        </p>
      </section>
    </div>
  );
}
