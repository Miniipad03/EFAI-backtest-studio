'use client';
import { useEffect, useRef, useState } from 'react';

export interface StockItem {
  code: string;
  name: string;
  market: string;
}

// 정적 캐시가 있는 인기 10종목 — API 장애 시에도 항상 동작
export const POPULAR_STOCKS: StockItem[] = [
  { code: '005930', name: '삼성전자', market: 'KOSPI' },
  { code: '000660', name: 'SK하이닉스', market: 'KOSPI' },
  { code: '035420', name: 'NAVER', market: 'KOSPI' },
  { code: '005380', name: '현대차', market: 'KOSPI' },
  { code: '051910', name: 'LG화학', market: 'KOSPI' },
  { code: '006400', name: '삼성SDI', market: 'KOSPI' },
  { code: '035720', name: '카카오', market: 'KOSPI' },
  { code: '000270', name: '기아', market: 'KOSPI' },
  { code: '068270', name: '셀트리온', market: 'KOSPI' },
  { code: '105560', name: 'KB금융', market: 'KOSPI' },
];

let krxListCache: StockItem[] | null = null;

async function loadKrxList(): Promise<StockItem[]> {
  if (krxListCache) return krxListCache;
  try {
    const res = await fetch('/data/krx_list.json');
    if (res.ok) krxListCache = (await res.json()) as StockItem[];
  } catch {
    // 리스트 로드 실패 시 인기종목만으로 동작
  }
  return krxListCache ?? POPULAR_STOCKS;
}

interface Props {
  selected: StockItem | null;
  onSelect: (stock: StockItem) => void;
}

export default function StockSearch({ selected, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<StockItem[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const search = async (q: string) => {
    setQuery(q);
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) {
      setMatches([]);
      setOpen(false);
      return;
    }
    const list = await loadKrxList();
    const found = list
      .filter(s => s.name.toLowerCase().includes(trimmed) || s.code.startsWith(trimmed))
      .slice(0, 8);
    setMatches(found);
    setHighlight(0);
    setOpen(found.length > 0);
    // 리스트에 없는 6자리 숫자는 직접 입력 코드로 허용
    if (found.length === 0 && /^\d{6}$/.test(q.trim())) {
      onSelect({ code: q.trim(), name: '', market: '' });
    }
  };

  const pick = (s: StockItem) => {
    onSelect(s);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matches[highlight]) pick(matches[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">종목 검색</label>
      <div ref={boxRef} className="relative">
        <input
          value={query}
          onChange={e => search(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="종목명 또는 코드 입력 (예: 삼성전자)"
          className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
        />
        {open && (
          <ul className="absolute z-20 mt-1 w-full bg-surface-card border border-surface-border rounded-lg overflow-hidden shadow-xl">
            {matches.map((s, i) => (
              <li key={s.code}>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => pick(s)}
                  onMouseEnter={() => setHighlight(i)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left ${
                    i === highlight ? 'bg-brand/20' : ''
                  }`}
                >
                  <span>
                    {s.name} <span className="text-slate-500">{s.code}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{s.market}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selected && (
        <p className="text-xs text-slate-400 mt-1.5">
          선택됨:{' '}
          <span className="text-brand font-medium">
            {selected.name ? `${selected.name} (${selected.code})` : selected.code}
          </span>
        </p>
      )}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {POPULAR_STOCKS.map(s => (
          <button
            key={s.code}
            type="button"
            onClick={() => pick(s)}
            className={`px-2 py-1 rounded-md text-xs transition-colors ${
              selected?.code === s.code
                ? 'bg-brand text-white'
                : 'bg-surface border border-surface-border text-slate-400 hover:border-brand hover:text-slate-200'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
