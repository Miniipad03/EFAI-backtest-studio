import StrategyTabs from '@/components/StrategyTabs';

export default function StrategiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">전략 가이드</h1>
        <p className="text-slate-400 text-sm">각 매매 전략의 원리와 파라미터를 확인하세요.</p>
      </div>
      <StrategyTabs />
    </div>
  );
}
