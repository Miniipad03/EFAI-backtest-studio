import type { Trade } from '@/lib/backtest/types';

export default function TradesTable({ trades }: { trades: Trade[] }) {
  const sells = trades.filter(t => t.side === 'sell');
  if (sells.length === 0) return <p className="text-slate-400 text-sm">매도 거래가 없습니다.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border text-slate-400">
            {['날짜', '매도가', '수량', '수수료+세금', '손익'].map(h => (
              <th key={h} className={`py-2 px-3 ${h === '날짜' ? 'text-left' : 'text-right'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sells.map((t, i) => (
            <tr key={i} className="border-b border-surface-border/50 hover:bg-surface-card/50">
              <td className="py-2 px-3 text-slate-300">{t.date}</td>
              <td className="py-2 px-3 text-right">₩{Math.round(t.price).toLocaleString()}</td>
              <td className="py-2 px-3 text-right">{t.qty.toLocaleString()}</td>
              <td className="py-2 px-3 text-right text-slate-400">₩{Math.round(t.fee + t.tax).toLocaleString()}</td>
              <td className={`py-2 px-3 text-right font-medium ${t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.pnl >= 0 ? '+' : ''}₩{Math.round(t.pnl).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
